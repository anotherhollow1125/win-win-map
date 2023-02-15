use anyhow::{anyhow, Result};
use std::sync::Mutex;
use tokio::sync::mpsc::{channel, Receiver, Sender};
use windows::Win32::System::Com::{CoInitialize, CoUninitialize};

pub(crate) struct Chan<Item>
where
    Item: std::fmt::Debug + Sync + Send + 'static,
{
    sender: Mutex<Option<Sender<Item>>>,
    receiver: Mutex<Option<Receiver<Item>>>,
}

impl<Item> Chan<Item>
where
    Item: std::fmt::Debug + Sync + Send + 'static,
{
    pub fn new() -> Self {
        let (sender, receiver) = channel(256);
        Chan {
            sender: Mutex::new(Some(sender)),
            receiver: Mutex::new(Some(receiver)),
        }
    }

    pub fn take_receiver(&self) -> Result<Option<Receiver<Item>>> {
        let Ok(mut receiver) = self.receiver.lock() else {
            return Err(anyhow!("receiver lock failed"));
        };
        let receiver = receiver.take();
        Ok(receiver)
    }

    /*
    pub fn drop_sender(&self) -> Result<()> {
        let Ok(mut sender) = self.sender.lock() else {
            return Err(anyhow!("sender lock failed"));
        };
        sender.take();
        Ok(())
    }
    */

    pub fn send(&self, item: Item) -> Result<()> {
        let Ok(sender) = self.sender.lock() else {
            return Err(anyhow!("sender lock failed"));
        };
        let Some(sender) = sender.as_ref() else {
            return Err(anyhow!("sender already closed"));
        };
        sender.blocking_send(item)?;
        Ok(())
    }

    // Dropトレイトで表現したかったけど思いついてません...
    pub fn close_and_reset(&self) -> Result<()> {
        let Ok(mut sender) = self.sender.lock() else {
            return Err(anyhow!("sender lock failed"));
        };
        let Ok(mut receiver) = self.receiver.lock() else {
            return Err(anyhow!("receiver lock failed"));
        };
        let (new_sender, new_receiver) = channel(256);
        *sender = Some(new_sender);
        *receiver = Some(new_receiver);
        Ok(())
    }
}

pub struct Com;

impl Com {
    pub fn new() -> Result<Self> {
        unsafe {
            println!("CoInitialize");
            CoInitialize(None)?;
        }

        Ok(Com)
    }
}

impl Drop for Com {
    fn drop(&mut self) {
        use std::io::{stdout, Write};
        unsafe {
            println!("CoUninitialize");
            stdout().flush().unwrap();
            CoUninitialize();
        }
    }
}
