export class MessageSlider {

  box = null;
  color = '#000';

  constructor() {
  }
  setMessage(msg) {
    this.msg = msg;
    if (this.box !== null) {
      this.box.find('.message').html(msg);
    }
    else {
      this.box = this.createBox(msg);
    }
    return this;
  }
  setColor(color) {

    if (this.box !== null) {
      this.box.find('.message').css('color', color);
    }
    else {
      this.box = this.createBox(msg);
    }
    return this;
  }
  createBox(msg) {
    this.box = $(`
    <div class="message-slider">
      <div class="message">${msg}</div>
    </div>`);

    
    this.box.css({
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      background: '#f0f0f0',
      border : '2px solid #000',
      color: this.color,
      padding: '1rem',
      fontFamily: 'Georgia',
      borderRadius: '5px',
      minWidth: '5rem',
      maxWidth: '8rem',
      textAlign: 'center',
      boxShadow: '5px 5px 0 #000',
      transform: 'rotateX(10deg) rotateY(-10deg)',
      zIndex: 9999
    })   
    $('body').append(this.box);
    this.boxWidth = this.box.outerWidth();
    this.box.css({
      left: `-${this.boxWidth}px`
    });
    return this.box;
  }
  slideIn({slideIn, slideOut, slideOutDelay}) {

    const boxHeight      = this.box[0].offsetHeight; // Höhe der Box ermitteln
    const viewportHeight = window.innerHeight; // Höhe des Viewports ermitteln
    const maxHeight      = viewportHeight - 20; // maximal zulässige Höhe (mit einem kleinen Abstand)

    if (boxHeight > maxHeight) {
      // Box ist zu hoch, Höhe anpassen
      this.box[0].style.height = `${maxHeight}px`;
    }


    this.box.animate({
      left: -7
    }, slideIn ), this.slideOut(slideOut, slideOutDelay);
  }

  slideOut(duration, delay) {
    this.box.delay(delay).animate({
      left: `-${this.boxWidth + 7}px`
    }, duration);
  }
}