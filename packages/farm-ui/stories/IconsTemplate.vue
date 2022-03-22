<template>
  <div>
    <farm-stack space="s">
      <farm-card>
        <farm-stack space="s">
          <h1>farmOS Field Kit Icons</h1>
          <p>
            The icon set for farmOS Field Kit is comprised mainly of icons from
            the <a href="https://material.io/tools/icons/" target="_blank">
            Material Design Icon Set</a>. They've been wrapped as Vue components
            and registered globally so they can be accessed by any module. Our
            naming convention prefixes them with `icon-`, so for example, if you
            wanted to use the "Add Circle" icon, you'd include it in your
            tempate as <code>&lt;icon-add-circle/&gt;</code>.
          </p>
          <p>
            The props for any icon include <code>width</code>, <code>height</code>,
            and <code>fill</code>. The default heigh and width is <code>24</code>,
            which is in pixels; however, for this demo, only the height is
            adjustable, with the width pinned to the value of the height, and
            the default is set to <code>60</code> for greater visibility.
          </p>
        </farm-stack>
      </farm-card>
      <icon-tiles :height="height" :fill="fill" />
    </farm-stack>
  </div>
</template>

<script>
import components from '../src/components';

function convertPascalToKebab(name) {
  return name
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
    .replace(/^[^a-zA-Z]+/g, '')
    .toLowerCase();
}

function convertNameToTitle(name) {
  return name
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1 $2')
    .replace(/Icon/g, '')
    .trim();
}

function convertNameToTag(name) {
  return `<${convertPascalToKebab(name)}/>`;
}

const IconTiles = {
  name: 'IconTiles',
  props: {
    height: {
      type: Number,
      default: 60,
    },
    fill: {
      type: String,
      default: 'var(--dark)',
    },
  },
  render() {
    const { h } = window.Vue;
    return h(
      'farm-tiles',
      components
        .filter(c => c.name.startsWith('Icon'))
        .map(icon => h(
          'farm-card',
          { width: 'full' },
          [h(
            'farm-stack',
            { align: 'center' },
            [
              h(
                'div',
                [h(icon, { width: this.height, height: this.height, fill: this.fill })],
              ),
              h('h4', convertNameToTitle(icon.name)),
              h('pre', convertNameToTag(icon.name)),
            ],
          )],
        )),
    );
  },
};

export default {
  name: 'IconsTemplate',
  props: {
    height: {
      type: Number,
      default: 60,
    },
    fill: {
      type: String,
      default: 'var(--dark)',
    },
  },
  components: { IconTiles },
};
</script>

<style>

</style>
