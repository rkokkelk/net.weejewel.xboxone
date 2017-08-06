"use strict";

const Homey = require('homey');

class XboxOneApp extends Homey.App {
  
  onInit() {
    this.log("XBoxOne is ready ");
  }
  
}

module.exports = XboxOneApp; 
