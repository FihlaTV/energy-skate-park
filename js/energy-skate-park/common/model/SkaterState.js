// Copyright 2013-2019, University of Colorado Boulder

/**
 * Immutable snapshot of skater state for updating the physics. To improve performance, operate solely on a skaterState
 * instance without updating the real skater, so that the skater model itself can be set only once, and trigger
 * callbacks only once (no matter how many subdivisions). This can also facilitate debugging and ensuring energy is
 * conserved from one step to another. Pooled to avoid allocation problems, see #50. Another reason this class is
 * valuable is to create and evaluate proposed states before applying them to the live model.
 *
 * @author Sam Reid
 */
define( require => {
  'use strict';

  // modules
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const EMPTY_OBJECT = {};

  class SkaterState {

    /**
     * Create a SkaterSate from a SkaterState or Skater
     * @param {Skater|SkaterSate} source
     * @param {*] overrides the new values
     * @constructor
     */
    constructor( source, overrides ) {
      this.setState( source, overrides );
    }

    /**
     * Create a new SkaterState.
     * @param {Skater|SkaterState} source the initial values to use
     * @param {*} overrides the new values to override in the source
     * @returns {SkaterState} the new SkaterState
     */
    setState( source, overrides ) {

      if ( !overrides ) {
        overrides = EMPTY_OBJECT;
      }


      // Handle the case of a skater passed in (which has a position vector) or a SkaterState passed in, which has a number
      if ( source.positionProperty ) {
        this.positionX = 'positionX' in overrides ? overrides.positionX : source.positionProperty.value.x;
        this.positionY = 'positionY' in overrides ? overrides.positionY : source.positionProperty.value.y;

        this.velocityX = 'velocityX' in overrides ? overrides.velocityX : source.velocityProperty.value.x;
        this.velocityY = 'velocityY' in overrides ? overrides.velocityY : source.velocityProperty.value.y;
      }
      else {
        this.positionX = 'positionX' in overrides ? overrides.positionX : source.positionX;
        this.positionY = 'positionY' in overrides ? overrides.positionY : source.positionY;

        this.velocityX = 'velocityX' in overrides ? overrides.velocityX : source.velocityX;
        this.velocityY = 'velocityY' in overrides ? overrides.velocityY : source.velocityY;
      }

      // This code is called many times from the physics loop, so must be optimized for speed and memory
      // Special handling for values that can be null, false or zero
      this.gravity = getValue( 'gravity', source, overrides );
      this.referenceHeight = getValue( 'referenceHeight', source, overrides );
      this.mass = getValue( 'mass', source, overrides );
      this.track = getValue( 'track', source, overrides );
      this.angle = getValue( 'angle', source, overrides );
      this.onTopSideOfTrack = getValue( 'onTopSideOfTrack', source, overrides );
      this.parametricPosition = getValue( 'parametricPosition', source, overrides );
      this.parametricSpeed = getValue( 'parametricSpeed', source, overrides );
      this.dragging = getValue( 'dragging', source, overrides );
      this.thermalEnergy = getValue( 'thermalEnergy', source, overrides );

      // Some sanity tests
      assert && assert( isFinite( this.thermalEnergy ) );
      assert && assert( isFinite( this.velocityX ) );
      assert && assert( isFinite( this.velocityY ) );
      assert && assert( isFinite( this.parametricSpeed ) );

      assert && assert( this.thermalEnergy >= 0 );

      return this;
    }

    /**
     * Get the total energy in this state. Computed directly instead of using other methods to (hopefully) improve
     * performance.
     *
     * @returns {number}
     */
    getTotalEnergy() {
      return 0.5 * this.mass * (this.velocityX * this.velocityX + this.velocityY * this.velocityY) - this.mass * this.gravity * ( this.positionY - this.referenceHeight ) + this.thermalEnergy;
    }

    /**
     * Get the kinetic energy with KE = 1/2 * m * v^2
     *
     * @returns {number}
     */
    getKineticEnergy() {
      return 0.5 * this.mass * (this.velocityX * this.velocityX + this.velocityY * this.velocityY);
    }

    /**
     * Get the potential energy with PE = mgh.
     *
     * @returns {number}
     */
    getPotentialEnergy() {
      return -this.mass * this.gravity * ( this.positionY - this.referenceHeight );
    }

    /**
     * Update and return a new skater state with the values of this skater state and an object that will override
     * the values.
     *
     * @param {Object} overrides
     * @returns {SkaterState}
     */
    update( overrides ) { return new SkaterState( this, overrides ); }

    /**
     * Get the curvature at the skater's point on the track, by setting it to the pass-by-reference argument.
     *
     * @public
     * @param {Object} curvature - description of curvature at a point, looks like
     *                             {r: {number}, x: {number}, y: {number} }
     */
    getCurvature( curvature ) {
      this.track.getCurvature( this.parametricPosition, curvature );
    }

    /**
     * Apply skate to skater. Only set values that have changed.
     *
     * @param {Skater} skater
     */
    setToSkater( skater ) {
      skater.trackProperty.value = this.track;

      // Set property values manually to avoid allocations, see #50
      skater.positionProperty.value.x = this.positionX;
      skater.positionProperty.value.y = this.positionY;
      skater.positionProperty.notifyListenersStatic();

      skater.velocityProperty.value.x = this.velocityX;
      skater.velocityProperty.value.y = this.velocityY;
      skater.velocityProperty.notifyListenersStatic();

      skater.parametricPositionProperty.value = this.parametricPosition;
      skater.parametricSpeedProperty.value = this.parametricSpeed;
      skater.thermalEnergyProperty.value = this.thermalEnergy;
      skater.onTopSideOfTrackProperty.value = this.onTopSideOfTrack;
      skater.angleProperty.value = skater.trackProperty.value ? skater.trackProperty.value.getViewAngleAt( this.parametricPosition ) + (this.onTopSideOfTrack ? 0 : Math.PI) : this.angle;
      skater.updateEnergy();
    }

    /**
     * Create a new SkaterState with the new values. Provided as a convenience to avoid allocating options argument
     * (as in update).
     *
     * @param {Track} track
     * @param {number} parametricSpeed
     * @returns {SkaterState}
     */
    updateTrackUD( track, parametricSpeed ) {
      const state = new SkaterState( this, EMPTY_OBJECT );
      state.track = track;
      state.parametricSpeed = parametricSpeed;
      return state;
    }

    /**
     * Create a new SkaterState with the new values. Provided as a convenience to avoid allocating options argument
     * (as in update).
     *
     * @param {number} parametricPosition
     * @param {number} parametricSpeed
     * @param {number} velocityX
     * @param {number} velocityY
     * @param {number} positionX
     * @param {number} positionY
     * @returns {SkaterState}
     */
    updateUUDVelocityPosition( parametricPosition, parametricSpeed, velocityX, velocityY, positionX, positionY ) {
      const state = new SkaterState( this, EMPTY_OBJECT );
      state.parametricPosition = parametricPosition;
      state.parametricSpeed = parametricSpeed;
      state.velocityX = velocityX;
      state.velocityY = velocityY;
      state.positionX = positionX;
      state.positionY = positionY;
      return state;
    }

    /**
     * Update the position, angle, skater side of track, and velocity of the skater state.
     *
     * @param {number} positionX
     * @param {number} positionY
     * @param {number} angle
     * @param {number} onTopSideOfTrack
     * @param {number} velocityX
     * @param {number} velocityY
     * @returns {SkaterState}
     */
    updatePositionAngleUpVelocity( positionX, positionY, angle, onTopSideOfTrack, velocityX, velocityY ) {
      const state = new SkaterState( this, EMPTY_OBJECT );
      state.angle = angle;
      state.onTopSideOfTrack = onTopSideOfTrack;
      state.velocityX = velocityX;
      state.velocityY = velocityY;
      state.positionX = positionX;
      state.positionY = positionY;
      return state;
    }

    /**
     * Update the thermal energy.
     *
     * @param {number} thermalEnergy
     * @returns {SkaterState}
     */
    updateThermalEnergy( thermalEnergy ) {
      assert && assert( thermalEnergy >= 0 );

      const state = new SkaterState( this, EMPTY_OBJECT );
      state.thermalEnergy = thermalEnergy;
      return state;
    }

    /**
     * Update the parametric position and position.
     *
     * @param {Vector2} parametricPosition
     * @param {number} positionX
     * @param {number} positionY
     * @returns {SkaterState}
     */
    updateUPosition( parametricPosition, positionX, positionY ) {
      const state = new SkaterState( this, EMPTY_OBJECT );
      state.parametricPosition = parametricPosition;
      state.positionX = positionX;
      state.positionY = positionY;
      return state;
    }

    /**
     * Transition the SkaterState to the ground, updating thermal energy, angle, and velocity components
     * accordingly.
     *
     * @param {number} thermalEnergy
     * @param {number} velocityX
     * @param {number} velocityY
     * @param {number} positionX
     * @param {number} positionY
     * @returns {SkaterState}
     */
    switchToGround( thermalEnergy, velocityX, velocityY, positionX, positionY ) {
      assert && assert( thermalEnergy >= 0 );

      const state = new SkaterState( this, EMPTY_OBJECT );
      state.thermalEnergy = thermalEnergy;
      state.track = null;
      state.onTopSideOfTrack = true;
      state.angle = 0;
      state.velocityX = velocityX;
      state.velocityY = velocityY;
      state.positionX = positionX;
      state.positionY = positionY;
      return state;
    }

    /**
     * Strike the ground (usually through falling). Velocity is zeroed as the skater hits the ground.
     *
     * @param {number} thermalEnergy
     * @param {number} positionX
     * @returns {SkaterState}
     */
    strikeGround( thermalEnergy, positionX ) {
      assert && assert( thermalEnergy >= 0 );

      const state = new SkaterState( this, EMPTY_OBJECT );
      state.thermalEnergy = thermalEnergy;
      state.positionX = positionX;
      state.positionY = 0;
      state.velocityX = 0;
      state.velocityY = 0;
      state.angle = 0;
      state.onTopSideOfTrack = true;
      return state;
    }

    /**
     * Create an exact copy of this SkaterState.
     * @returns {SkaterState}
     */
    copy() {
      return new SkaterState( this, EMPTY_OBJECT );
    }

    /**
     * Leave the track by zeroing the parametric speed and setting track to null.
     *
     * @returns {SkaterState}
     */
    leaveTrack() {
      const state = new SkaterState( this, EMPTY_OBJECT );
      state.parametricSpeed = 0;
      state.track = null;
      return state;
    }

    /**
     * Create a new SkaterState copied from this SkaterState, updating position.
     *
     * @param {number} positionX
     * @param {number} positionY
     * @returns {SkaterState}
     */
    updatePosition( positionX, positionY ) {
      const state = new SkaterState( this, EMPTY_OBJECT );
      state.positionX = positionX;
      state.positionY = positionY;
      return state;
    }

    /**
     * Update velocity. Provided as a convenience method to avoid allocating objects with options (as in update).
     *
     * @param {number} parametricSpeed
     * @param {number} velocityX
     * @param {number} velocityY
     *
     * @returns {SkaterState}
     */
    updateUDVelocity( parametricSpeed, velocityX, velocityY ) {
      const state = new SkaterState( this, EMPTY_OBJECT );
      state.parametricSpeed = parametricSpeed;
      state.velocityX = velocityX;
      state.velocityY = velocityY;
      return state;
    }

    /**
     * Return a new skater state. New state is a copy of this SkaterState, with velocity and position updated to
     * reflect free fall.
     *
     * @param {number} velocityX
     * @param {number} velocityY
     * @param {number} positionX
     * @param {number} positionY
     *
     * @returns {SkaterState}
     */
    continueFreeFall( velocityX, velocityY, positionX, positionY ) {
      const state = new SkaterState( this, EMPTY_OBJECT );
      state.velocityX = velocityX;
      state.velocityY = velocityY;
      state.positionX = positionX;
      state.positionY = positionY;
      return state;
    }

    /**
     * Return SkaterState to track, creating and returning a new SkaterState.
     *
     * @param {number} thermalEnergy
     * @param {Track} track
     * @param {boolean} onTopSideOfTrack
     * @param {Vector2} parametricPosition
     * @param {number} parametricSpeed
     * @param {number} velocityX
     * @param {number} velocityY
     * @param {number} positionX
     * @param {number} positionY
     * @returns {SkaterState}
     */
    attachToTrack( thermalEnergy, track, onTopSideOfTrack, parametricPosition, parametricSpeed, velocityX, velocityY, positionX, positionY ) {
      assert && assert( thermalEnergy >= 0 );

      const state = new SkaterState( this, EMPTY_OBJECT );
      state.thermalEnergy = thermalEnergy;
      state.track = track;
      state.onTopSideOfTrack = onTopSideOfTrack;
      state.parametricPosition = parametricPosition;
      state.parametricSpeed = parametricSpeed;
      state.velocityX = velocityX;
      state.velocityY = velocityY;
      state.positionX = positionX;
      state.positionY = positionY;
      return state;
    }

    /**
     * Get the speed of this SkaterState, the magnitude of velocity.
     * @returns {number}
     */
    getSpeed() {
      return Math.sqrt( this.velocityX * this.velocityX + this.velocityY * this.velocityY );
    }

    /**
     * Return a new Vector2 of this SkaterState's that does not reference this SkaterState's velocity.
     * @returns {Vector2}
     */
    getVelocity() {
      return new Vector2( this.velocityX, this.velocityY );
    }

    /**
     * Get the speed of this SkaterState from kinetic energy, using KE = 1/2 * m * v^2.
     * @public
     *
     * @param {number} kineticEnergy
     * @returns {number}
     */
    getSpeedFromEnergy( kineticEnergy ) {
      return Math.sqrt( 2 * Math.abs( kineticEnergy ) / this.mass );
    }

    // TODO: Pooling support for SkaterState?
    freeToPool() {}

    /**
     * Create a new Vector2 that contains the positionX/positionY of this SkaterState.
     *
     * @returns {Vector2}
     */
    getPosition() {
      return new Vector2( this.positionX, this.positionY );
    }
  }

  const getValue = ( key, source, overrides ) => {
    return key in overrides ? overrides[ key ] :
           typeof source[ key + 'Property' ] === 'object' ? source[ key + 'Property' ].value :
           source[ key ];
  };

  return energySkatePark.register( 'SkaterState', SkaterState );
} );