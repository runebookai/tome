use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;

use anyhow::{anyhow, Result};
use futures::stream::{BoxStream, StreamExt};
use futures::{Sink, Stream};
use reqwest::{Client, Response};
use rmcp::service::{RxJsonRpcMessage, TxJsonRpcMessage};
use rmcp::transport::IntoTransport;
use serde_json::{json, Value};
use tokio::sync::{mpsc, Mutex};

#[derive(Debug, Clone)]
pub struct HttpTransportConfig {
    pub url: String,
    pub timeout: Duration,
    pub _retries: u32,
    pub session_id: Option<String>,
    pub headers: HashMap<String, String>,
}

impl Default for HttpTransportConfig {
    fn default() -> Self {
        Self {
            url: String::new(),
            timeout: Duration::from_secs(30),
            _retries: 3,
            session_id: None,
            headers: HashMap::new(),
        }
    }
}

pub struct HttpTransport {
    config: Arc<Mutex<HttpTransportConfig>>,
    client: Client,
}

impl HttpTransport {
    pub fn new(config: HttpTransportConfig) -> Self {
        let client = Client::builder()
            .timeout(config.timeout)
            .build()
            .expect("Failed to create HTTP client");

        Self { 
            config: Arc::new(Mutex::new(config)), 
            client 
        }
    }

    pub async fn get_session_id(&self) -> Option<String> {
        let config = self.config.lock().await;
        config.session_id.clone()
    }

    pub async fn initialize_session(&self) -> Result<()> {
        let mut config = self.config.lock().await;
        
        // Send initialize request
        let init_request = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2025-03-26",
                "capabilities": {
                    "tools": {}
                },
                "clientInfo": {
                    "name": "tome",
                    "version": "0.9.0"
                }
            }
        });

        let response = self.send_request_with_config(&config, init_request).await?;
        
        // Extract session ID from response headers
        if let Some(session_id) = response.headers().get("Mcp-Session-Id") {
            if let Ok(session_id_str) = session_id.to_str() {
                config.session_id = Some(session_id_str.to_string());
                log::info!("HTTP MCP session initialized with ID: {}", session_id_str);
            }
        }

        // Send initialized notification
        let initialized_notification = json!({
            "jsonrpc": "2.0",
            "method": "notifications/initialized"
        });

        self.send_request_with_config(&config, initialized_notification).await?;
        Ok(())
    }

    async fn send_request_with_config(&self, config: &HttpTransportConfig, body: Value) -> Result<Response> {
        let mut request = self.client
            .post(&config.url)
            .header("Content-Type", "application/json")
            .header("Accept", "application/json, text/event-stream");

        // Add session ID header if present
        if let Some(session_id) = &config.session_id {
            request = request.header("Mcp-Session-Id", session_id);
        }

        // Add custom headers
        for (key, value) in &config.headers {
            request = request.header(key, value);
        }

        let response = request.json(&body).send().await?;

        if !response.status().is_success() {
            return Err(anyhow!("HTTP request failed with status: {}", response.status()));
        }

        Ok(response)
    }

    async fn _send_request(&self, body: Value) -> Result<Response> {
        let config = self.config.lock().await;
        self.send_request_with_config(&config, body).await
    }

    async fn _handle_sse_stream(&self, response: Response) -> Result<BoxStream<'static, Value>> {
        let content_type = response.headers()
            .get("content-type")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("");

        if content_type.contains("text/event-stream") {
            // Handle SSE stream
            let mut stream = response.bytes_stream();
            let (tx, rx) = mpsc::unbounded_channel();

            tokio::spawn(async move {
                let mut buffer = String::new();
                
                while let Some(chunk) = stream.next().await {
                    match chunk {
                        Ok(bytes) => {
                            buffer.push_str(&String::from_utf8_lossy(&bytes));
                            
                            // Process complete SSE events
                            while let Some(event_end) = buffer.find("\n\n") {
                                let event_data = buffer[..event_end].to_string();
                                buffer = buffer[event_end + 2..].to_string();
                                
                                if let Some(json_data) = Self::parse_sse_event(&event_data) {
                                    if let Ok(value) = serde_json::from_str::<Value>(&json_data) {
                                        if tx.send(value).is_err() {
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        Err(_) => break,
                    }
                }
            });

            Ok(Box::pin(tokio_stream::wrappers::UnboundedReceiverStream::new(rx)))
        } else {
            // Handle single JSON response
            let json: Value = response.json().await?;
            let (tx, rx) = mpsc::unbounded_channel();
            let _ = tx.send(json);
            Ok(Box::pin(tokio_stream::wrappers::UnboundedReceiverStream::new(rx)))
        }
    }

    fn parse_sse_event(event_data: &str) -> Option<String> {
        for line in event_data.lines() {
            if let Some(data) = line.strip_prefix("data: ") {
                return Some(data.to_string());
            }
        }
        None
    }
}

pub struct HttpTransportSink {
    config: Arc<Mutex<HttpTransportConfig>>,
    client: Client,
}

impl HttpTransportSink {
    pub fn new(config: Arc<Mutex<HttpTransportConfig>>) -> Self {
        let client = Client::builder()
            .build()
            .expect("Failed to create HTTP client");

        Self { config, client }
    }
}

impl Sink<TxJsonRpcMessage<rmcp::service::RoleClient>> for HttpTransportSink {
    type Error = std::io::Error;

    fn poll_ready(
        self: std::pin::Pin<&mut Self>,
        _cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        std::task::Poll::Ready(Ok(()))
    }

    fn start_send(
        self: std::pin::Pin<&mut Self>,
        item: TxJsonRpcMessage<rmcp::service::RoleClient>,
    ) -> Result<(), Self::Error> {
        let this = self.get_mut();
        let json_value = serde_json::to_value(&item)
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;

        let config = this.config.clone();
        let client = this.client.clone();

        tokio::spawn(async move {
            let config_guard = config.lock().await;
            if let Err(e) = HttpTransport::send_request_static(&client, &config_guard, json_value).await {
                log::error!("Failed to send HTTP request: {}", e);
            }
        });

        Ok(())
    }

    fn poll_flush(
        self: std::pin::Pin<&mut Self>,
        _cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        std::task::Poll::Ready(Ok(()))
    }

    fn poll_close(
        self: std::pin::Pin<&mut Self>,
        _cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        std::task::Poll::Ready(Ok(()))
    }
}

impl HttpTransport {
    async fn send_request_static(
        client: &Client,
        config: &HttpTransportConfig,
        body: Value,
    ) -> Result<Response> {
        let mut request = client
            .post(&config.url)
            .header("Content-Type", "application/json")
            .header("Accept", "application/json, text/event-stream");

        if let Some(session_id) = &config.session_id {
            request = request.header("Mcp-Session-Id", session_id);
        }

        for (key, value) in &config.headers {
            request = request.header(key, value);
        }

        let response = request.json(&body).send().await?;

        if !response.status().is_success() {
            return Err(anyhow!("HTTP request failed with status: {}", response.status()));
        }

        Ok(response)
    }
}

pub struct HttpTransportStream {
    stream: BoxStream<'static, Value>,
}

impl HttpTransportStream {
    pub fn new(stream: BoxStream<'static, Value>) -> Self {
        Self { stream }
    }
}

impl Stream for HttpTransportStream {
    type Item = RxJsonRpcMessage<rmcp::service::RoleClient>;

    fn poll_next(
        mut self: std::pin::Pin<&mut Self>,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Option<Self::Item>> {
        match self.stream.poll_next_unpin(cx) {
            std::task::Poll::Ready(Some(value)) => {
                match serde_json::from_value::<RxJsonRpcMessage<rmcp::service::RoleClient>>(value) {
                    Ok(message) => std::task::Poll::Ready(Some(message)),
                    Err(e) => {
                        log::error!("Failed to deserialize JSON-RPC message: {}", e);
                        // Continue polling for the next message
                        cx.waker().wake_by_ref();
                        std::task::Poll::Pending
                    }
                }
            }
            std::task::Poll::Ready(None) => std::task::Poll::Ready(None),
            std::task::Poll::Pending => std::task::Poll::Pending,
        }
    }
}

impl IntoTransport<rmcp::service::RoleClient, std::io::Error, ()> for HttpTransport {
    fn into_transport(
        self,
    ) -> (
        impl Sink<TxJsonRpcMessage<rmcp::service::RoleClient>, Error = std::io::Error> + Send + 'static,
        impl Stream<Item = RxJsonRpcMessage<rmcp::service::RoleClient>> + Send + 'static,
    ) {
        let sink = HttpTransportSink::new(self.config.clone());
        
        // For the stream, we need to establish a GET connection for SSE
        let stream_config = self.config.clone();
        let stream_client = self.client.clone();
        
        let (tx, rx) = mpsc::unbounded_channel();
        
        tokio::spawn(async move {
            if let Err(e) = Self::establish_sse_connection(stream_client, stream_config, tx).await {
                log::error!("Failed to establish SSE connection: {}", e);
            }
        });
        
        let stream = HttpTransportStream::new(Box::pin(
            tokio_stream::wrappers::UnboundedReceiverStream::new(rx)
        ));
        
        (sink, stream)
    }
}

impl HttpTransport {
    async fn establish_sse_connection(
        client: Client,
        config: Arc<Mutex<HttpTransportConfig>>,
        tx: mpsc::UnboundedSender<Value>,
    ) -> Result<()> {
        let config_guard = config.lock().await;
        let mut request = client
            .get(&config_guard.url)
            .header("Accept", "text/event-stream");

        if let Some(session_id) = &config_guard.session_id {
            request = request.header("Mcp-Session-Id", session_id);
        }

        for (key, value) in &config_guard.headers {
            request = request.header(key, value);
        }
        
        drop(config_guard); // Release the lock before sending the request

        let response = request.send().await?;

        if !response.status().is_success() {
            return Err(anyhow!("SSE connection failed with status: {}", response.status()));
        }

        let mut stream = response.bytes_stream();
        let mut buffer = String::new();

        while let Some(chunk) = stream.next().await {
            match chunk {
                Ok(bytes) => {
                    buffer.push_str(&String::from_utf8_lossy(&bytes));
                    
                    while let Some(event_end) = buffer.find("\n\n") {
                        let event_data = buffer[..event_end].to_string();
                        buffer = buffer[event_end + 2..].to_string();
                        
                        if let Some(json_data) = Self::parse_sse_event(&event_data) {
                            if let Ok(value) = serde_json::from_str::<Value>(&json_data) {
                                if tx.send(value).is_err() {
                                    return Ok(());
                                }
                            }
                        }
                    }
                }
                Err(e) => {
                    log::error!("SSE stream error: {}", e);
                    break;
                }
            }
        }

        Ok(())
    }
}