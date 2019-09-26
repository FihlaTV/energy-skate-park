// Copyright 2018-2019, University of Colorado Boulder

/**
 * A model for track sets in Energy Skate Park "Full", which has a parabola, slope, loop, and double well tracks.
 * Tracks are not draggable, and may support friction.
 * @author Jesse Greenberg
 */

define( require => {
  'use strict';

  // modules
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const EnergySkateParkTrackSetModel = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/model/EnergySkateParkTrackSetModel' );
  const PremadeTracks = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/model/PremadeTracks' );


  class EnergySkateParkFullTrackSetModel extends EnergySkateParkTrackSetModel {

    /**
     * @param {boolean} frictionAllowed
     * @param {Tandem} tandem
     * @param {Object} options
     */
    constructor( frictionAllowed, tandem, options ) {
      super( frictionAllowed, tandem, options );

      // the "full" track set has all of the premade tracks - a parabola,  slope, double well, and loop.
      const trackSet = EnergySkateParkTrackSetModel.createBasicTrackSet( this, tandem );

      const loopControlPoints = PremadeTracks.createLoopControlPoints( this.controlPointGroupTandem, {
        limitPointBounds: this.limitPointBounds
      } );
      const loopTrack = PremadeTracks.createTrack( this, this.tracks, loopControlPoints, this.availableModelBoundsProperty, {
        configurable: this.tracksConfigurable,
        draggable: this.tracksDraggable,
        tandem: tandem.createTandem( 'loopTrack' )
      } );
      trackSet.push( loopTrack );


      // NOTE: It would have been nice to pass the tracks to EnergySkateParkTrackSetModel, but tracks require knowledge
      // of the model they are being added to so this isn't possible.
      this.addTrackSet( trackSet );
    }
  }

  return energySkatePark.register( 'EnergySkateParkFullTrackSetModel', EnergySkateParkFullTrackSetModel );
} );
