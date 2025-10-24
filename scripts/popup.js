class Popups {
  missingJqueryMessage = "jQuery is not available, please include jQuery before Popups.js";

  
 /**
  * Initializes a new instance of the Popups class with specified settings or default values.
  *
  * @param {Object} [setting={}] - Configuration options for popups.
  * @param {number} [setting.ttl=5000] - Time in milliseconds before a popup expires.
  * @param {number} [setting.speed=700] - Animation speed in milliseconds for popup transitions.
  * @param {boolean} [setting.ErrorPopupsDisabled=false] - Flag to disable error popups.
  * @param {Object|number} [setting.distance={ "top": 80, "right": 40, "bottom": 70, "left": 40 }] - Distance from screen edges in pixels.
  * @param {Object|number} [setting.displayLimit={ "top": 5, "top-corners": 5, "right": 5, "bottom": 5, "bottom-corners":5, "left": 5 }] - Maximum number of popups shown simultaneously.
  * @param {number} [setting.spaceBetween=10] - Space in pixels between popups.
  * @param {Object} [setting.style={}] - CSS styles to apply to popups, overriding default styles.
  * @param {string} [setting.style.maxWidth="400px"] - Maximum width of popups.
  * @param {string} [setting.style.maxHeight="400px"] - Maximum height of popups.
  * @param {string} [setting.style.bgColor="hsl(359deg, 3.07%, 19.41%)"] - Background color of popups.
  * @param {string} [setting.style.color="#fff"] - Text color of popups.
  * @param {string} [setting.style.fontFamily="'Roboto'"] - Font family for popup text.
  * @param {string} [setting.style.fontSize="16px"] - Font size for popup text.
  * @param {string} [setting.style.border="none"] - Border style of popups.
  * @param {string} [setting.style.borderRadius="25px"] - Border radius for rounded corners.
  * @param {string} [setting.style.boxShadow="none"] - Box shadow style for popups.
  * @param {number} [setting.style.zIndex=5001] - Z-index for popup stacking order.
  * @param {string} [setting.style.padding="5px"] - Padding inside popups.
  *
  * 
  * @defaults
  * - ttl: 5000
  * - speed: 700
  * - ErrorPopupsDisabled: false
  * - distance: { "top": 80, "right": 40, "bottom": 70, "left": 40 }
  * - displayLimit: { "top": 5, "top-corners": 5, "right": 5, "bottom": 5, "bottom-corners":5, "left": 5 }
  * - spaceBetween: 10
  * - style: {
  *     maxWidth: "400px",
  *     maxHeight: "400px",
  *     bgColor: "hsl(359deg, 3.07%, 19.41%)",
  *     color: "#fff",
  *     fontFamily: "'Roboto'",
  *     fontSize: "16px",
  *     border: "none",
  *     borderRadius: "25px",
  *     boxShadow: "none",
  *     zIndex: 5001,
  *     padding: "5px"
  *   }
  * 
  * @throws {Error} If jQuery is not available.
  * 
  * @author Julien
  * 
  * @since 05.12.2024
  * 
  * @version 1.1
 */
  constructor(setting = {}) {
    const defaultSettings = {
      ttl: 5000,
      speed: 700,
      ErrorPopupsDisabled: false,
      distance: { "top": 80, "right": 40, "bottom": 70, "left": 40 },
      displayLimit: { "top": 5, "top-corners": 5, "right": 5, "bottom": 5, "bottom-corners":5, "left": 5 },
      spaceBetween: 10,
      style: {
        maxWidth: "400px",
        maxHeight: "400px",
        bgColor: "hsl(359deg, 3.07%, 19.41%)",
        color: "#fff",
        fontFamily: "'Roboto'",
        fontSize: "16px",
        border: "none",
        borderRadius: "25px",
        boxShadow: "none",
        zIndex: 5001,
        padding: "5px",
      }
    };

    if(typeof jQuery === "undefined") {
      this.hasjquery = false;
      throw new Error(this.missingJqueryMessage);
    }
    else this.hasjquery = true

    if(typeof setting.distance === "number") setting.distance = { "top": setting.distance, "right": setting.distance, "bottom": setting.distance, "left": setting.distance };
    if(typeof setting.displayLimit === "number") setting.displayLimit = { "top": setting.displayLimit, "right": setting.displayLimit, "bottom": setting.displayLimit, "left": setting.displayLimit };

    this.ttl = setting.ttl || defaultSettings.ttl;
    this.speed = setting.speed || defaultSettings.speed;
    this.spaceBetween = setting.spaceBetween || defaultSettings.spaceBetween;
    this.style = { ...defaultSettings.style, ...setting.style };
    this.distance = { ...defaultSettings.distance, ...setting.distance };
    this.displayLimit = { ...defaultSettings.displayLimit, ...setting.displayLimit };
    this.ErrorPopupsDisabled = { ...defaultSettings.ErrorPopupsDisabled, ...setting.ErrorPopupsDisabled };
    
    this.popupMap = new Map();
  }

  ms2s() {
    return this.speed / 1000
  }

  setCss(element, msg, where, styling) {
    const css = {};
    
    css["position"] = "fixed";
    css["pointer-events"] = "none";
    css["max-width"] = styling.maxWidth;
    css["width"] = styling.width;
    css["max-height"] = styling.maxHeight;
    css["height"] = "fit-content";
    css["padding"] = styling.padding;
    css["background-color"] = styling.bgColor;
    css["border"] = styling.border;
    css["border-radius"] = styling.borderRadius;
    css["box-sizing"] = "border-box";
    css["box-shadow"] = styling.boxShadow;
    css["z-index"] = styling.zIndex;
    css["overflow"] = "hidden";
    css["rotate"] = styling.rotate;
    css["box-shadow"] = styling.boxShadow;
    css["text-align"] = styling.textAlign;

    

    $(msg).css({
      "margin": "0",
      "font-size": styling.fontSize,
      "font-family": styling.fontFamily,
      "color": styling.color,
    });
    
    switch (where) {
      case "top-left":
        css["top"] = this.distance.top + "px";
        css["left"] = "0px";
        css["transform"] = "translate(-100%, 0%)";
        break;
      case "top":
        css["top"] = "0px";
        css["left"] = "50%";
        css["transform"] = "translate(-50%, -100%)";
        break;
      case "top-right":
        css["top"] = this.distance.top + "px";
        css["right"] = "0px";
        css["transform"] = "translate(100%, 0%)";
        break;
      case "left":
        css["top"] = "50%";
        css["left"] = "0px";
        css["transform"] = "translate(-100%, -50%)";
        break;
      case "bottom-left":
        css["left"] = "0px";
        css["bottom"] = this.distance.bottom + "px";
        css["transform"] = "translate(-100%, 0%)"
        break;
      case "right":
        css["top"] = "50%";
        css["right"] = "0px";
        css["transform"] = "translate(100%, -50%)";
        break;
      case "bottom-right":
        css["right"] = "0px";
        css["transform"] = "translate(100%, 0%)"
        css["bottom"] = this.distance.bottom + "px";
        break;
      case "bottom":
      default:
        css["left"] = "50%";
        css["bottom"] = "0px";
        css["transform"] = "translate(-50%, 100%)";
        break;
    }

    element.css(css);
    setTimeout(() => {
      const afterMove = {};
      afterMove["transition"] = "transform "+this.ms2s()+"s, opacity "+this.ms2s()+"s";
      afterMove["transition-behavior"] = "ease-in-out";
      afterMove["visibility"] = "visible";
      element.css(afterMove);
    }, 0);
    
  }

  /**
   * Checks if a popup exists
   * @param {string} identifier - the identifier of the popup
   * @returns {boolean} true if the popup exists, false otherwise
   */
  popup_exists(identifier) {
    if(this.popupMap.get(identifier)) return true;
    return false;
  }

  throw_error(message, where= "bottom", time= this.ttl) {
    this.create_popup(message, {where: where, type: 3, time, style:{bgColor: "#ce0f16",  color: "#fff", border: "1px solid #E1302A", borderRadius: "25px", zIndex: 9001}});
  }

  /**
   * Spawns a new popup
   * @param {string} message - the message to be displayed
   * @param {Object} [options] - the options
   * @param {string} [options.identifier] - the identifier of the popup
   * @param {number} [options.type] - the type of the popup (1= perma, 2= single, 3= error)
   * @param {string} [options.where] - the position of the popup (top, right, bottom, left)
   * @param {number} [options.time] - the time to live in ms
   * @param {Object} [options.style] - individual styles
   * @returns {string} the identifier of the popup
   */
  create_popup(message, options={}) {
    const preset_options = {
      identifier: crypto.randomUUID(),
      type:1,
      where: "bottom",
      time: this.ttl,
      style: this.style
    }

    const using_options = { ...preset_options, ...options };

    if(!this.hasjquery) {
      throw new Error(this.missingJqueryMessage);
    }

    let popupStyle = { ...this.style, ...using_options.style };

    if(this.popup_exists(using_options.identifier)) {
      if(this.ErrorPopupsDisabled == false) {
        this.throw_error("Identifier ist bereits vegeben", "bottom-left");
      }
      throw new Error("Identifier ist bereits vegeben");
    }
    if(!["top-left", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left"].includes(using_options.where)) {
      if(this.ErrorPopupsDisabled == false) {
        this.throw_error("ungültige Position", "bottom-left");
      }
      throw new Error("ungültige Position");
    }

    const popup = document.createElement("div");
    popup.style.visibility = "hidden";
    const msg = document.createElement("p");

    popup.classList.add('popup');
    popup.classList.add('popup-'+using_options.where);
    if(using_options.type == 3) {
      popup.classList.add('popup-error');
    }

    msg.innerText = message;

    popup.appendChild(msg);
    document.body.appendChild(popup);
    
    this.popupMap.set(using_options.identifier, {
      element: popup,
      side: using_options.where,
      type: using_options.type,
      active: false,
      time: using_options.time,
      to_id: null,
      hide_reason: 1,
      style: popupStyle,
      currentOffset: 0
    });
    
    let jQpopup = jQuery(popup)
    this.setCss(jQpopup, msg, using_options.where, { ...this.style, ...popupStyle});
    
    if(using_options.type == 1) {
      return using_options.identifier;
    }

    else {
      this.show_popup(using_options.identifier);
      return void(0);  
    }
  }
  
  /**
   * Removes a popup
   * @param {string} identifier - the identifier of the popup
   */
  remove_popup(identifier) {
    const popup = this.popupMap.get(identifier);
    if(popup) {
      $(popup.element).css({"opacity": 0});
      setTimeout(() => {
        this.popupMap.delete(identifier);
        $(popup.element).remove();
      }, 500);
    }
  }

  /**
   * Hides a popup
   * @param {string} identifier - the identifier of the popup
   */
  hide_popup(identifier) {
    if(!this.hasjquery) {
      throw new Error(this.missingJqueryMessage);
    }
    const data = this.popupMap.get(identifier);
    let popup = jQuery(data["element"]);

    data.currentOffset = 0;

    popup.removeClass("active");
    data["active"]  = false;
    data["shoved"]  = null;
    data["to_id"]   = null;

    let return2 = {}
    let additional = {}
    return2["opacity"] = 0;
    if(data["side"] == "top") {
      return2["transform"] = "translate(-50%, -100%)";
    }

    if(data["side"].includes("left")) {
      return2["transform"] = "translate(-100%, -50%)";
      if(data["side"].includes("top") || data["side"].includes("bottom")) additional["transform"] = "translate(-100%, 0%)";
    }

    if(data["side"].includes("right")) {
      return2["transform"] = "translate(100%, -50%)";
      if(data["side"].includes("top") || data["side"].includes("bottom")) additional["transform"] = "translate(100%, 0%)";
    }

    if(data["side"] == "left") {
      if(data["hide_reason"] == 3) return2["transform"] = "translate(-100%, -50%)";
      else additional["transform"] = "translate(-100%, -50%)";
    }

    if(data["side"] == "right") {
      if(data["hide_reason"] == 3) return2["transform"] = "translate(100%, -50%)";
      else additional["transform"] = "translate(100%, -50%)";
    }

    if(data["side"] == "bottom") {
      return2["transform"] = "translate(-50%, 100%)";
    }
    
    if(data["hide_reason"] == 3) {
      popup.animate({opacity: "0"}, this.speed/2, "swing", () => {popup.css(return2);});

      data["hide_reason"] = 1;
    }
    else {
      return2["opacity"] = "0";
      popup.css(return2);
      setTimeout(() => {
        if(Object.keys(additional).length > 0) popup.css(additional);
      }, this.speed);
    }
  }
  
  /**
   * Shows a popup
   * @param {string} identifier - the identifier of the popup
   * @param {number} [speed=this.speed] - the animation speed in ms
   * @returns {void}
   */
  show_popup(identifier, speed= this.speed) {
    setTimeout(()=> {
      if(!this.hasjquery) {
        throw new Error(this.missingJqueryMessage);
      }
      let self = this;
      let data = this.popupMap.get(identifier);
      if(!data) {
        if(this.ErrorPopupsDisabled == false) {
          this.throw_error("ungültiger Identifier", "bottom-left");
        }
        throw new Error("ungültiger Identifier");
      }
      else if(data["active"] == false) {
        const popup = jQuery(data["element"]);
        const animateParam = { opacity: "1" };
        
        this.prevent_Overlap(identifier);
        data["active"] = true;
        switch (data["side"]) {
          case "top":
            animateParam["transform"] = "translate(-50%, "+this.distance.top+"px)";
            break;
          case "right":
            animateParam["transform"] = "translate(-"+this.distance.right+"px, -50%)";
            break;
          case "top-right":
          case "bottom-right":
            animateParam["transform"] = "translate(-"+this.distance.right+"px, 0%)";
            break;
          case "bottom":
            animateParam["transform"] = "translate(-50%, -"+this.distance.bottom+"px)";
            break;
          case "left":
            animateParam["transform"] = "translate("+this.distance.left+"px, -50%)";
            break;
          case "top-left":
          case "bottom-left":
            animateParam["transform"] = "translate("+this.distance.left+"px, 0%)";
            break;
          default:
            break;
        }

        popup.addClass("active").css(animateParam);

        if (data["to_id"] == null) {
          data["to_id"] = setTimeout(() => {
            if (data["type"] === 1) {
              data["hide_reason"] = 2;
              self.hide_popup(identifier);
            } else {
              self.remove_popup(identifier);
            }
          }, data["time"]);
        }
      }

      return void(0);
    }, 0);
  }


  /**
   * Checks if a popup would overlap with another one
   * @param {array} data - the data of the popup
   * @returns {array | boolean} - an array of the other active popups if the popup would overlap, false otherwise
   */
  wouldOverlap(data) {
    if(!this.hasjquery) {
      throw new Error(this.missingJqueryMessage);
    }
    const also_active = Array.from(this.popupMap.entries())
      .filter(([identifier, value]) => value.side === data.side && value.active === true && value.element !== data.element)
      .map(([identifier, value]) => ({identifier, value, flagged: false}));
    if(also_active.length > 0) {
      return also_active;
    }
    else {
      return false;
    }
  }

  /**
   * Moves another popup up to make space for a new one
   * @param {string} identifier - the identifier of the popup
   */
  prevent_Overlap(identifier) {
    if(!this.hasjquery) {
      throw new Error(this.missingJqueryMessage);
    }
    const current = this.popupMap.get(identifier);
    if(!current) {
      if(this.ErrorPopupsDisabled == false) {
        this.throw_error("ungültiger Identifier", "bottom-left");
      }
      throw new Error("ungültiger Identifier");
    }

    const ohters = this.wouldOverlap(this.popupMap.get(identifier))
    let limitKey = (current.side.includes("top-")) ? "top-corners" : (current.side.includes("bottom-")) ? "bottom-corners" : current.side;

    if(ohters) {
      if(ohters.length >= this.displayLimit[limitKey]) {
        var diff = ohters.length - this.displayLimit[limitKey];
        for(let i = 0; i <= diff; i++) {
          const other = ohters[i];
          if(!other) continue;
          clearTimeout(other.value.to_id);
          other.value.flagged = true;
        }
      }

      ohters.forEach(ohter => {
        if(!ohter) return;
        var pushspeed = this.speed/2;
        if(this.popupMap.get(ohter.identifier).active == false) {
          return;
        }
        let element = jQuery(ohter.value.element);

        let currentOffset = ohter.value.currentOffset;

        let offset = currentOffset + element.outerHeight() + this.spaceBetween;
        ohter.value.currentOffset = offset;
        //console.log(offset);
        let animate = {};
        if(ohter.value.side == "top") {
          var y_axis = (this.distance.top + offset);
          animate["transform"] = "translate(-50%, "+y_axis+"px)";
        }

        if(ohter.value.side.includes("left")) {
          animate["transform"] = "translate("+ this.distance.left +"px, calc(-50% - "+offset+"px))";
          if(ohter.value.side.includes("top")) {
            animate["transform"] = "translate("+ this.distance.left +"px, calc(0% + "+offset+"px))";
          }
          if(ohter.value.side.includes("bottom")) {
            animate["transform"] = "translate("+ this.distance.left +"px, calc(0% - "+offset+"px))";
          }
        }

        if(ohter.value.side.includes("right")) {
          animate["transform"] = "translate(-"+ this.distance.right +"px, calc(-50% - "+offset+"px))";
          if(ohter.value.side.includes("top")) {
            animate["transform"] = "translate(-"+ this.distance.right +"px, calc(0% + "+offset+"px))";
          }
          if(ohter.value.side.includes("bottom")) {
            animate["transform"] = "translate(-"+ this.distance.right +"px, calc(0% - "+offset+"px))";
          }
        }

        if(ohter.value.side == "bottom") {
          var y_axis = (this.distance.bottom + offset);
          animate["transform"] = "translate(-50%, -"+ y_axis +"px)";
        }
        //console.log(animate);
        if(Object.keys(animate).length > 0) {
          if(ohter.value.flagged) {
            animate["opacity"] = "0";
            element.css(animate);
            setTimeout(() => {
              if(ohter.value.type == 1) {
                ohter.value.hide_reason = 3
                this.hide_popup(ohter.identifier);
              }
              else {
                this.remove_popup(ohter.identifier);
              }
            }, pushspeed);
          }
          else {
            element.css(animate);
          }
        }
      });
    }
  }

}
export default Popups;