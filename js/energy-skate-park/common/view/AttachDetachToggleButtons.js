// Copyright 2014-2019, University of Colorado Boulder

/**
 * Scenery node for the Attach/Detach toggle buttons which determine whether the skater can fly off the track or not.
 * This was formerly called "roller coaster mode"
 *
 * @author Sam Reid
 */
define( require => {
  'use strict';

  // modules
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const Image = require( 'SCENERY/nodes/Image' );
  const merge = require( 'PHET_CORE/merge' );
  const Panel = require( 'SUN/Panel' );
  const RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );

  // images
  const attachIcon = require( 'image!ENERGY_SKATE_PARK/attach.png' );
  const detachIcon = require( 'image!ENERGY_SKATE_PARK/detach.png' );

  // constants
  const SELECTED_LINE_WIDTH = 2.3;

  class AttachDetachToggleButtons extends Panel {

    /**
     * Constructor for the AttachDetachToggleButtons
     * @param {Property<Boolean>} stickingToTrackProperty Axon property that is false if the model state allows the skater to detach
     * @param {Property<Boolean>} enabledProperty Axon property that is true if the control is enabled
     * @param {number} contentWidth Width for the control panel, to match the layout of the rest of the controls.
     * @param {Tandem} tandem
     * @param {Object} [options]
     * @constructor
     */
    constructor( stickingToTrackProperty, enabledProperty, contentWidth, tandem, options ) {

      // Match the style of the EnergySkateParkControlPanel
      options = merge( {
        fill: '#F0F0F0',
        stroke: null,
        xMargin: 15,
        yMargin: 5
      }, options );

      const scale = 0.32;

      // This is sort of hack to pass through the tandem of the radioButtonGroupMember to its child.
      const attachRadioButtonTandemName = 'attachRadioButton';
      const detachRadioButtonTandemName = 'detachRadioButton';
      const radioButtonGroupTandem = tandem.createTandem( 'radioButtonGroup' );
      const radioButtonsContent = [
        {
          value: true,
          node: new Image( attachIcon, {
            scale: scale,
            tandem: radioButtonGroupTandem.createTandem( attachRadioButtonTandemName ).createTandem( 'attachIcon' )
          } ),
          tandemName: attachRadioButtonTandemName
        },
        {
          value: false,
          node: new Image( detachIcon, {
            scale: scale,
            tandem: radioButtonGroupTandem.createTandem( detachRadioButtonTandemName ).createTandem( 'detachIcon' )
          } ),
          tandemName: detachRadioButtonTandemName
        }
      ];

      const buttonSpacing = contentWidth - ( options.xMargin * 2 ) - ( radioButtonsContent[ 0 ].node.width * 2 ) - SELECTED_LINE_WIDTH * 2;
      assert && assert( buttonSpacing > 0, 'buttons must have non zero spacing' );

      const radioButtons = new RadioButtonGroup( stickingToTrackProperty, radioButtonsContent,
        {
          buttonContentXMargin: 0,
          buttonContentYMargin: 0,
          baseColor: 'white',
          disabledBaseColor: 'rgba(255,255,255,0.5)',
          spacing: buttonSpacing,
          cornerRadius: 6,
          selectedLineWidth: SELECTED_LINE_WIDTH,
          selectedStroke: '#3291b8',
          deselectedStroke: 'gray',
          orientation: 'horizontal',
          tandem: radioButtonGroupTandem
        } );

      const panelOptions = merge( { tandem: tandem }, options );
      super( radioButtons, panelOptions );
    }
  }

  return energySkatePark.register( 'AttachDetachToggleButtons', AttachDetachToggleButtons );
} );