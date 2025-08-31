class DialogHelper {
  static async showEventEndErrorDialog(message: string): Promise<'ok' | 'ignore'> {
    return new Promise((resolve) => {
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: monospace;
      `;
      
      dialog.innerHTML = `
        <div style="
          background: #f44336;
          color: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 500px;
          text-align: center;
        ">
          <h3 style="margin: 0 0 10px 0;">⚠️ Event End Error (Debug Mode)</h3>
          <p style="margin: 10px 0;">${message}</p>
          <div style="margin-top: 20px;">
            <button id="ok-btn" style="
              background: #fff;
              color: #f44336;
              border: none;
              padding: 10px 20px;
              margin: 0 10px;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
            ">OK</button>
            <button id="ignore-btn" style="
              background: #666;
              color: white;
              border: none;
              padding: 10px 20px;
              margin: 0 10px;
              border-radius: 4px;
              cursor: pointer;
            ">Ignore Future Errors</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(dialog);
      
      const okBtn = dialog.querySelector('#ok-btn') as HTMLButtonElement;
      const ignoreBtn = dialog.querySelector('#ignore-btn') as HTMLButtonElement;
      
      okBtn.onclick = () => {
        document.body.removeChild(dialog);
        resolve('ok');
      };
      
      ignoreBtn.onclick = () => {
        document.body.removeChild(dialog);
        resolve('ignore');
      };
    });
  }

  static async showConfirmDialog(
    title: string,
    message: string,
    buttons: Array<{ text: string; action: () => void; primary?: boolean }>
  ): Promise<void> {
    return new Promise((resolve) => {
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: monospace;
      `;
      
      // Generate buttons HTML
      const buttonsHtml = buttons.map((button, index) => {
        const isPrimary = button.primary || index === 0;
        return `
          <button data-index="${index}" style="
            background: ${isPrimary ? '#fff' : '#666'};
            color: ${isPrimary ? '#2196F3' : 'white'};
            border: none;
            padding: 10px 20px;
            margin: 5px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: ${isPrimary ? 'bold' : 'normal'};
            min-width: 80px;
          ">${button.text}</button>
        `;
      }).join('');
      
      dialog.innerHTML = `
        <div style="
          background: #2196F3;
          color: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 500px;
          text-align: center;
        ">
          <h3 style="margin: 0 0 10px 0;">${title}</h3>
          <p style="margin: 10px 0;">${message}</p>
          <div style="margin-top: 20px; display: flex; flex-wrap: wrap; justify-content: center; gap: 5px;">
            ${buttonsHtml}
          </div>
        </div>
      `;
      
      document.body.appendChild(dialog);
      
      // Add click handlers for all buttons
      buttons.forEach((button, index) => {
        const btn = dialog.querySelector(`[data-index="${index}"]`) as HTMLButtonElement;
        btn.onclick = () => {
          document.body.removeChild(dialog);
          button.action();
          resolve();
        };
      });
    });
  }
}

export default DialogHelper