document.getElementById('generateButton').addEventListener('click', generateCombinedImage);

function generateCombinedImage() {
  const fileInput = document.getElementById('imageUploader');
  const files = fileInput.files;

  if (files.length < 2) {
    alert('2枚以上の画像をアップロードしてください！');
    return;
  }

  const canvas = document.getElementById('imageCanvas');
  const ctx = canvas.getContext('2d');

  const images = [];
  let totalWidth = 0;
  let maxHeight = 0;

  // 全ての画像を読み込む
  const loadPromises = Array.from(files).map(file => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        images.push(img);
        totalWidth += img.width;
        maxHeight = Math.max(maxHeight, img.height);
        resolve();
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  });

  Promise.all(loadPromises)
    .then(() => {
      // キャンバスサイズを設定
      canvas.width = totalWidth;
      canvas.height = maxHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 背景を透明に設定
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 画像を連結
      let xOffset = 0;
      images.forEach(img => {
        ctx.drawImage(img, xOffset, 0);
        xOffset += img.width;
      });

      // 透過PNGを生成
      const downloadLink = document.getElementById('downloadLink');
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.style.display = 'inline-block';
    })
    .catch(error => {
      console.error('画像の読み込み中にエラーが発生しました:', error);
    });
}

 // ESCキーでサイトに戻る
 window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
      window.location.href = "../サイト/desaku.html";
  }
});
