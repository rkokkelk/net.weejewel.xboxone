"use strict";

const Homey = require('homey');
const XboxOn = require('xbox-on');

const xbox_options = {
    tries: 5,
    delay: 1000,
    waitForCallback: false
  };

class XboxDriver extends Homey.Driver {

  onInit(){
		// Register homey default capability onoff
    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this))
	}

	onPair( socket ) {

		socket.on('validate', ( data, callback ) => {

			try {

				let xbox = new XboxOn( data.address, data.live_id );

				xbox.powerOn( xbox_options, ( err ) => {

					if( err ) return Promise.reject( err );

					// Then, emit a callback ( err, result )
					callback();
        });

			} catch( err ) {
				return Promise.reject( err );
			}

		});
	}

	// this method is called when the Device is added
	onAdded() {
			this.log('xbox added');
	}

	// this method is called when the Device is deleted
	onDeleted() {
			this.log('device deleted');
	}

	// this method is called when the Device has requested a state change (turned on or off)
	onCapabilityOnoff( value, opts, callback ) {
		let settings = this.getSettings();

		try {

			let xbox = new XboxOn( settings['address'], settings['live_id'] );

			xbox.powerOn( xbox_options, ( err ) => {

				if( err ) return Promise.reject( err );

				// Then, emit a callback ( err, result )
				callback();
			});

		} catch( err ) {
		// or, return a Promise
			return Promise.reject( err );
		}
	}
}

module.exports = XboxDriver;
