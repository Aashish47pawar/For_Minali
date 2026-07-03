let highestZ = 1;

class Paper {
  holdingPaper = false;
  rotating = false;

  currentPaperX = 0;
  currentPaperY = 0;
  rotation = Math.random() * 30 - 15;

  prevTouchX = 0;
  prevTouchY = 0;
  prevFingerAngle = 0; 
  
  dragged = false; // ADDED: Track if this paper has been moved

  init(paper) {
    // --- TOUCH START ---
    paper.addEventListener('touchstart', (e) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;
      
      paper.style.zIndex = highestZ;
      highestZ += 1;

      if (e.touches.length === 1) {
        this.prevTouchX = e.touches[0].clientX;
        this.prevTouchY = e.touches[0].clientY;
      }
      
      if (e.touches.length === 2) {
        this.rotating = true;
        this.prevFingerAngle = this.getFingerAngle(e);
      }
    }, { passive: false });


    // --- TOUCH MOVE ---
    paper.addEventListener('touchmove', (e) => {
      e.preventDefault(); 

      // Case 1: Dragging (1 finger)
      if (!this.rotating && e.touches.length === 1) {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;

        this.velX = touchX - this.prevTouchX;
        this.velY = touchY - this.prevTouchY;

        this.currentPaperX += this.velX;
        this.currentPaperY += this.velY;

        this.prevTouchX = touchX;
        this.prevTouchY = touchY;

        // ADDED: Mark as dragged and check if video should show
        if (!this.dragged) {
          this.dragged = true;
          checkAllPapersDragged();
        }
      }

      // Case 2: Rotating (2 fingers)
      if (e.touches.length === 2) {
        this.rotating = true;
        
        const currentAngle = this.getFingerAngle(e);
        const angleChange = currentAngle - this.prevFingerAngle;
        
        this.rotation += angleChange;
        this.prevFingerAngle = currentAngle;
      }

      paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
    }, { passive: false });


    // --- TOUCH END ---
    paper.addEventListener('touchend', (e) => {
      this.holdingPaper = false;
      this.rotating = false;

      if (e.touches.length === 1) {
        this.holdingPaper = true; 
        this.prevTouchX = e.touches[0].clientX;
        this.prevTouchY = e.touches[0].clientY;
      }
    });
  }

  getFingerAngle(e) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    const deltaY = touch2.clientY - touch1.clientY;
    const deltaX = touch2.clientX - touch1.clientX;
    
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  }
}

// ADDED: Logic to show the video
function checkAllPapersDragged() {
  const allPapersDragged = paperList.every((item) => item.instance.dragged);
  if (allPapersDragged) {
    const videoPaper = document.querySelector('.paper.video');
    if (videoPaper) {
      videoPaper.style.display = 'block';
    }
  }
}

// MODIFIED: Store instances so we can check their 'dragged' status
// Also using ':not(.video)' so the hidden video doesn't count as an undragged paper
const paperList = Array.from(document.querySelectorAll('.paper:not(.video)')).map((paper) => {
  const p = new Paper();
  p.init(paper);
  return { element: paper, instance: p };
});
