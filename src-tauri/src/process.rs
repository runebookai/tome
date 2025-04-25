use std::collections::HashSet;

use anyhow::Result;
use sysinfo::{Pid, System};

#[derive(PartialEq, Eq, Hash, Clone, Debug)]
pub struct Process {
    pub pid: Pid,
}

impl Process {
    pub fn current() -> Self {
        Self {
            pid: sysinfo::get_current_pid().unwrap(),
        }
    }

    pub fn find(pid: Pid) -> Option<Self> {
        System::new_all().process(pid).map(|_| Self { pid })
    }

    pub fn children(&self) -> Result<HashSet<Self>> {
        let mut procs: HashSet<Self> = HashSet::new();
        let sys = System::new_all();

        sys.processes().iter().for_each(|(pid, proc)| {
            if let Some(parent_pid) = proc.parent() {
                if parent_pid == self.pid {
                    let proc = Self { pid: *pid };
                    procs.insert(proc.clone());
                    procs.extend(proc.children().unwrap());
                }
            }
        });

        Ok(procs)
    }

    pub fn kill(&self) -> Result<bool> {
        let sys = System::new_all();

        self.children()?
            .iter()
            .all(|proc| match sys.process(proc.pid) {
                Some(p) => p.kill(),
                None => false,
            });

        if let Some(parent) = sys.process(self.pid) {
            Ok(parent.kill())
        } else {
            Ok(false)
        }
    }
}
