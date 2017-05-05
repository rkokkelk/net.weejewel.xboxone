"use strict";

const XboxOn = require('xbox-on');

const xbox_options = {
    tries: 5,
    delay: 1000,
    waitForCallback: false
  };

class XboxDriver {


	constructor() {

		this._devices = {};

		this.init 					= this._onInit.bind(this);
		this.pair 					= this._onPair.bind(this);
		this.added 					= this._onAdded.bind(this);
		this.deleted 				= this._onDeleted.bind(this);
		this.settings 				= this._onSettings.bind(this);

		this.capabilities 			= {};
		this.capabilities.onoff 	= {};
		this.capabilities.onoff.get = this._onCapabilitiesOnoffGet.bind(this);
		this.capabilities.onoff.set = this._onCapabilitiesOnoffSet.bind(this);

		Homey.manager('flow').on('action.power_on', this._onFlowActionPowerOn.bind(this));

	}

	_onInit( devices_data, callback ) {

		devices_data.forEach( this._initDevice.bind(this) );

		callback( null, true );
	}

	_onPair( socket ) {

		socket.on('validate', ( data, callback ) => {

			try {
				var xbox = new XboxOn( data.address, data.live_id );
				xbox.powerOn( xbox_options, ( err ) => {
					if( err ) return callback( err );
					return callback();
        });
			} catch( err ) {
				return callback( err );
			}

		})

	}

	_onAdded( device_data ) {
		this._initDevice( device_data );
	}

	_onDeleted( device_data ) {
		this._uninitDevice( device_data );
	}

	_onSettings( device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback ) {

		var device = this._getDevice( device_data );
		if( device instanceof Error ) return callback( device );

		this._uninitDevice( device_data );
		this._initDevice( device_data );

		callback( null, true );

	}

	_onCapabilitiesOnoffGet( device_data, callback ) {

		var device = this._getDevice( device_data );
		if( device instanceof Error ) return callback( device );

		return callback( null, device.state.onoff );

	}

	_onCapabilitiesOnoffSet( device_data, value, callback ) {

		var device = this._getDevice( device_data );
		if( device instanceof Error ) return callback( device );

		device.state.onoff = value;

		if( value === true ) {
			try {
				device.xbox.powerOn( xbox_options, ( err ) => {
					if( err ) return callback( err );
					return callback( null, true );
				});
			} catch( err ) {
				return callback( err );
			}
		} else {
			return callback( new Error('off_not_implemented') );
		}

	}

	_initDevice( device_data ) {

		this.getSettings( device_data, ( err, settings ) => {
			if( err ) return console.error(err);

			this._devices[ device_data.live_id ] = {
				xbox: new XboxOn( settings.address, settings.live_id ),
				state: {
					onoff	: false
				}
			}
		});
	}

	_uninitDevice( device_data ) {
		delete this._devices[ device_data.live_id ];
	}

	_getDevice( device_data ) {
		return this._devices[ device_data.live_id ] || new Error('invalid_device');
	}

	_onFlowActionPowerOn( callback, args, state ) {
		this.capabilities.onoff.set( args.device, true, callback );
	}

}

module.exports = ( new XboxDriver() );
