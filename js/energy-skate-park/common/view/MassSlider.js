// Copyright 2019, University of Colorado Boulder

/**
 * A slider that controls the mass Property of the skater in energy skate park.
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const PhysicalSlider = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/view/PhysicalSlider' );

  // strings
  const controlsMassString = require( 'string!ENERGY_SKATE_PARK/controls.mass' );
  const smallString = require( 'string!ENERGY_SKATE_PARK/small' );
  const largeString = require( 'string!ENERGY_SKATE_PARK/large' );

  class MassSlider extends PhysicalSlider {

    /**
     * @param {NumberProperty} property
     * @param {Range} massRange
     * @param {Tandem} tandem
     */
    constructor( property, massRange, tandem ) {
      super( controlsMassString, property, massRange, tandem, {
        minLabel: smallString,
        maxLabel: largeString
      } );
    }
  }

  return energySkatePark.register( 'MassSlider', MassSlider );
} );
