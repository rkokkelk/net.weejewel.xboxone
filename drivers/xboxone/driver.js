"use strict";

const Homey = require('homey');
const XboxOn = require('xbox-on');

const xbox_options = {
    tries: 5,
    delay: 1000,
    waitForCallback: false
  };

class XboxDriver extends Homey.Driver {

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

}

module.exports = XboxDriver;
