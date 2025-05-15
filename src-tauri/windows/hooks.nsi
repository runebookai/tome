!macro NSIS_HOOK_POSTINSTALL
    ExecWait 'msiexec /i "$INSTDIR\node-v22.11.0-x64.msi" /passive'
!macroend