<template>
  <div id="app">
    <h3>{{headerText}}</h3>

      <login v-if="this.displayState === 'displayLogin'" @didSubmitCredentials="checkCredentials" ></login>

      <new-observation v-if="this.displayState === 'displayNewObservation'" :dataStore="dataStore" @didSubmitObservation="saveObservation" ></new-observation>

    <!--Somehow, this causes an extra copy of the above template to appear-->
    <!--<router-view/>-->

    <!--  Trying to display recorded observations in the observations view
      <br>
      <observations v-if="this.displayState === 'displayNewObservation'" :recordStore="recordStore"></observations>
      -->
    <div class="well">
      <p>{{ statusText }}</p>
    </div>

  <!--unclear if I need to include a template stub for the data module -->
  <DataNative></DataNative>

  </div>
</template>

<script>
import DataNative from './components/DataNative'
import Login from './components/Login'
import NewObservation from './components/NewObservation'
//import Observations from './components/Observations'
//import Calendar from './components/Calendar'

export default {
  name: 'App',
  components: {
  DataNative,
  Login,
  NewObservation,
  //Observations,
  //Calendar,
  },
  data () {
  return {
    headerText: 'Please enter your farmOS credentials',
    displayState: 'displayLogin',
    statusText: '',
    // Get data from an imported component
    dataStore: DataNative.data().assets,
    // Get computed data from an imported component
    //recordStore: DataNative.computed.observations()
    }
  },
  methods:{
    checkCredentials (creds) {
      this.headerText = 'Welcome '+creds[0]+'!';
      this.displayState = 'displayNewObservation';

      console.log('observations:');
      console.log(this.recordStore)
    },

    // I should parse this in an iterative way, cycling through object properties
    saveObservation (obs) {

      this.statusText = "Recorded "
      for (var i in obs){
        // create string
        var objText = ''
        if ( obs[i] !== '' ){
          objText = i+': '+obs[i]+'; ';
        }
        this.statusText = this.statusText+objText
      }

      this.displayState = 'displayNewObservation'
    }
}//methods

}
</script>

<style>
/*
I pasted in the content of style.css from farmOS: profiles/farm/theme/farm-theme/css
Sadly, this appears to do nothing
*/

.navbar.container, .navbar.container-fluid {
  margin-top: 0;
}

/**
 * Nudge the logo down a bit.
 */
.navbar .logo {
  padding-top: 5px;
}

/**
 * Reset calendar class width in menu.
 */
.menu .calendar {
  width: auto;
}

/**
 * Hide page title on homepage.
 */
body.front h1.page-header {
  display: none;
}

/**
 * Style help glyphicon in page title.
 */
.page-header .glyphicon-question-sign {
  color: #3a87ad;
  cursor: pointer;
  font-size: 0.75em;
}

/**
 * Remove padding and list style from user login block links (request new password).
 */
form#user-login-form ul {
  padding-left: 0;
}
form#user-login-form ul li {
  list-style: none;
}

/**
 * Add up/down arrow to collapsible fieldset and accordion headings.
 */
.resp-accordion:after,
fieldset.collapsible .panel-heading .fieldset-legend:after {
  font-family: 'Glyphicons Halflings';
  content: "\e113";
  float: left;
  color: grey;
  margin-right: 10px;
  transition: all 0.5s;
}
.resp-accordion.resp-tab-active:after,
fieldset.collapsible .panel-heading .fieldset-legend.collapsed:after {
  -webkit-transform: rotate(180deg);
  -moz-transform: rotate(180deg);
  transform: rotate(180deg);
}
.resp-accordion .resp-arrow {
  display: none;
}

/**
 * Override styles of responsive accordion tabs/content to match Bootstrap.
 */
h2.resp-accordion {
  background-color: #fcfcfc !important;
}
.resp-vtabs .resp-tabs-container,
.resp-vtabs li.resp-tab-active,
h2.resp-tab-active,
.resp-tab-content {
  border-color: #dddddd !important;
}
.resp-tabs-container {
  margin-bottom: 1em;
}

/**
 * Tweak widths of responsive vertical tabs.
 */
.resp-vtabs ul.resp-tabs-list {
  width: 15%;
}
.resp-vtabs .resp-tabs-container {
  width: 85%;
}
@media only screen and (max-width: 768px) {
  .resp-vtabs .resp-tabs-container {
    width: 100%;
  }
}

/**
 * Colorbox image styles.
 * @see farm_theme_preprocess_field() in template.php.
 */
.field-name-field-farm-images .field-item {
  float: left;
  padding: 5px;
}

/**
 * Fix DateAPI field styles.
 */
.container-inline-date {
  margin-bottom: 10px;
}
.container-inline-date .control-label {
  display: block;
}
.container-inline-date .date-padding {
  padding-left: 0;
}

/**
 * Fix Views exposed filter/sort.
 */
.views-exposed-form .views-exposed-widget .form-submit {
  margin-top: 1.6em;
  padding: 6px 12px;
}

/**
 * Fix checkboxes in Views Bulk Operations.
 */
.views-field-views-bulk-operations .checkbox input[type="checkbox"] {
  margin-left: 0;
  position: relative;
}

/**
 * Display VBO checkboxes inline in Views Tree displays.
 * Note: the .views-tree class must be added manually to the View's
 * "Advanced > CSS class" setting.
 */
.views-tree .views-field-views-bulk-operations div.checkbox {
  display: inline;
}
.views-tree .views-field-views-bulk-operations .checkbox label {
  padding-left: 0;
}

/**
 * Increase the default font size within maps to create larger buttons.
 */
.openlayers-map-container .gm-style {
  font-size: 16px;
}

/**
 * Set max-height and overflow styles for layerswitcher.
 */
.openlayers-map-container .layer-switcher .panel {
  max-height: 400px;
  overflow-y: auto;
}

/**
 * Fix Modal popup close button (x).
 * See https://www.drupal.org/node/2563967
 */
.modal-header .close {
  color: #222222;
}

/**
 * Improve Bootstrap Tour styling.
 */
.tour .btn {
  padding: 6px 12px;
}
.tour .popover-content {
  font-size: 16px;
}

</style>
