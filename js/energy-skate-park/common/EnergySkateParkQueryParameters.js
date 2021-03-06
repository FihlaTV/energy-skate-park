// Copyright 2016-2019, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 */
define( require => {
  'use strict';

  // modules
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );

  const EnergySkateParkQueryParameters = QueryStringMachine.getAll( {

    // Print out console messages related to the physics
    debugLog: { type: 'flag' },

    // Print out console messages related to attaching and detaching from the tracks
    debugAttachDetach: { type: 'flag' },

    // By default, the control panels are in a fixed relative location to the sim and cannot float all the way to the
    // sides, but specifying 'floating' allows them to go all the way to the sides.
    controlPanelLocation: { type: 'string', defaultValue: 'fixed', validValues: [ 'fixed', 'floating' ] },

    // Show a testing track (as indicated by testTrackIndex)
    debugTrack: { type: 'flag' },

    // Shows the drag bounds for the control points on the premade tracks - normal behavior is for them to only be
    // visible during drag
    showPointBounds: { type: 'flag' },

    // If debugTrack is true, this indicates the index (1-based) of the track to show
    testTrackIndex: {
      type: 'number',
      defaultValue: 1
    }
  } );

  energySkatePark.register( 'EnergySkateParkQueryParameters', EnergySkateParkQueryParameters );

  return EnergySkateParkQueryParameters;
} );
