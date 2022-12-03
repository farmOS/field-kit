<template>
  <app-bar-options :title="$t('Edit Log')" nav="back" :actions="appBarActions"/>
  <farm-stack v-if="log" :space="['none', 'none', 's']" :dividers="true">

    <farm-card>
      <div class="form-item form-group">
        <farm-toggle-check
          :label="$t('Done')"
          labelPosition="after"
          :checked="log.status === 'done'"
          @input="update({ status: $event ? 'done' : 'pending' })"/>
      </div>
      <div class="form-item form-item-name form-group">
        <label for="name" class="control-label">{{ $t('Name') }}</label>
        <input
          :value="log.name"
          @input="update({ name: $event.target.value })"
          :placeholder="$t('Enter name')"
          type="text"
          class="form-control"
          maxlength="250"
          autofocus>
      </div>
      <farm-date-time-form
        :timestamp="log.timestamp"
        @input="update({ timestamp: $event })"/>
      <div class="form-item form-item-name form-group">
        <label for="type" class="control-label ">{{ $t('Log Type') }}</label>
        <div class="form-item">
          <p> {{ $t(typeLabel) }} </p>
        </div>
      </div>
    </farm-card>

    <farm-card>
      <div class="form-item form-item-name form-group">
        <label for="notes" class="control-label ">{{ $t('Notes') }}</label>
        <textarea
          :value="parseNotes(log.notes)"
          @input="updateNotes($event.target.value)"
          :placeholder="$t('Enter notes')"
          type="text"
          rows="4"
          class="form-control">
        </textarea>
      </div>
    </farm-card>

    <farm-card>
      <h3>{{ $t('Log Categories') }}</h3>
      <div v-if="showAllCategories" id="categories" class="form-item form-group">
        <farm-select-box
          small
          v-for="cat in categories"
          :id="`category-${cat.id}-${cat.name}`"
          :selected="log.category.some(c => c.id === cat.id)"
          :label="cat.name"
          :key="`category-${cat.id}-${cat.name}`"
          @input="toggleRelationship('category', cat)">
        </farm-select-box>
        <div class="show-hide">
          <div @click="showAllCategories = !showAllCategories">
            <p><icon-expand-less/>{{ $t('Show Less') }}</p>
          </div>
        </div>
      </div>
      <div v-else id="categories" class="form-item form-group">
        <p v-if="!log.category || log.category.length < 1">
          {{ $t('No categories selected') }}
        </p>
        <farm-select-box
          small
          v-for="cat in categories.selected"
          :id="`category-${cat.id}-${cat.name}`"
          :selected="true"
          :label="cat.name"
          :key="`category-${cat.id}-${cat.name}`"
          @input="toggleRelationship('category', cat)">
        </farm-select-box>
        <div class="show-hide">
          <div @click="showAllCategories = !showAllCategories">
            <p><icon-expand-more/>{{ $t('Show More') }}</p>
          </div>
        </div>
      </div>
    </farm-card>

    <farm-card v-if="log.quantity !== undefined">
      <h3>{{ $t('Quantities')}} 🚧 UNDER CONSTRUCTION 🚧</h3>
      <label for="quantity" class="control-label ">
        {{ $t('Add new or edit existing quantity')}}
      </label>
      <div v-if="currentQuant >= 0" class="form-item form-item-name form-group">
        <!-- To display a placeholder value ONLY when there are no existing
        quantities, we must add the placeholder with an <option> tag and
        select it using the :value option -->
        <select
          :value="(quantities.length > 0 && quantities[currentQuant].measure)
            ? quantities[currentQuant].measure
            : 'Select measure'"
          @input="updateQuantity('measure', $event.target.value, currentQuant)"
          class="custom-select col-sm-3 ">
            <option>{{ $t('Select measure')}}</option>
            <option
              v-for="(measure, i) in quantMeasures"
              :value="measure"
              :key="`measure-${i}`">
              {{ measure }}
            </option>
        </select>
        <input
          :value="(quantities.length > 0)
            ? quantities[currentQuant].value
            : null"
          @input="updateQuantity('value', $event.target.value, currentQuant)"
          :placeholder="$t('Enter value')"
          type="number"
          class="form-control"/>
        <select
          :value="(quantities.length > 0 && quantities[currentQuant].unit)
            ? quantities[currentQuant].unit.id
            : 'Select unit'"
          @input="updateQuantity('unit', $event.target.value, currentQuant)"
          class="custom-select col-sm-3 ">
            <option>{{ $t('Select unit')}}</option>
            <option
              v-for="(unit, i) in units"
              :value="unit.id"
              :key="`unit-${i}`">
              {{ (units) ? unit.name : '' }}
            </option>
        </select>
        <input
          :value="(quantities.length > 0)
            ? quantities[currentQuant].label
            : null"
          @input="updateQuantity('label', $event.target.value, currentQuant)"
          :placeholder="$t('Enter label')"
          type="text"
          class="form-control"/>
      </div>
      <div class="form-item form-group">
        <ul
          v-if="quantities.length > 0"
          class="list-group">
          <li
            v-for="(quant, i) in quantities"
            v-bind:key="`quantity-${i}`"
            @click="currentQuant = i"
            class="list-group-item">
            {{ quant.measure }}&nbsp;
            {{ quant.value }}&nbsp;
            {{ quant.units }}&nbsp;
            {{ quant.label }}
            <span class="remove-list-item" @click="removeQuant(i); $event.stopPropagation()">
              &#x2715;
            </span>
          </li>
        </ul>
      </div>
      <div class="form-item form-group">
        <button
          type="button"
          class="btn btn-success"
          @click="updateQuantity(null, null, -1)"
          name="addNewQuantity">
          {{$t('Add another quantity')}}
        </button>
      </div>
    </farm-card>

    <farm-card>
      <h3>{{ $t('Assets')}}</h3>
      <farm-autocomplete
        :list="assets.unselected"
        :keys="['name']"
        @select="toggleRelationship('asset', assets.unselected[$event])"
        :label="$t('Add assets to the log')">
        <template v-slot:empty>
          <div class="empty-slot">
            <em>{{ $t('No assets found.')}}</em>
          </div>
        </template>
      </farm-autocomplete>
      <div class="form-item form-item-name form-group">
        <ul class="list-group">
          <li
            v-for="asset in assets.selected"
            :key="`asset-${asset.id}`"
            class="list-group-item">
            {{ asset.name }}
            <span class="remove-list-item" @click="toggleRelationship('asset', asset)">
              &#x2715;
            </span>
          </li>
        </ul>
      </div>
      <div v-if="log.equipment" class="form-item form-item-name form-group">
        <label for="type" class="control-label ">{{ $t('Equipment') }}</label>
        <div class="input-group">
          <select
            @input="toggleRelationship('equipment', equipment.unselected[i])"
            class="custom-select col-sm-3 ">
            <option value=""></option>
            <option
              v-for="(equip, i) in equipment.unselected"
              :value="i"
              :key="`equip-${i}`">
              {{ (equip) ? equip.name : '' }}
            </option>
          </select>
        </div>
      </div>
      <div class="form-item form-group">
        <ul v-if="log.equipment" class="list-group">
          <li
            v-for="(equip, i) in equipment.selected"
            v-bind:key="`equipment-${i}`"
            class="list-group-item">
            {{ equip.name }}
            <span class="remove-list-item" @click="toggleEqupment(false, equip.id)">
              &#x2715;
            </span>
          </li>
        </ul>
      </div>
    </farm-card>

    <farm-card>
      <h3>{{ $t('Areas')}} &amp; {{ $t('Location')}}</h3>
      <farm-autocomplete
        :list="locations.unselected"
        :keys="['name']"
        @select="toggleRelationship('location', locations.unselected[$event])"
        :label="$t('Add areas to the log')">
        <template v-slot:empty>
          <div class="empty-slot">
            <em>{{ $t('No areas found.')}}</em>
          </div>
        </template>
      </farm-autocomplete>
      <div class="form-item form-item-name form-group">
        <ul class="list-group">
          <li
            v-for="location in locations.selected"
            v-bind:key="`remove-area-${location.id}`"
            class="list-group-item">
            {{ location.name }}
            <span class="remove-list-item" @click="toggleRelationship('location', area)">
              &#x2715;
            </span>
          </li>
        </ul>
      </div>
    </farm-card>

  </farm-stack>
</template>

<script>
const {
  computed, inject, reactive, ref,
} = window.Vue;
const {
  R,
  parseNotes,
} = window.lib;

// Used to separate assets, areas, etc into those that have already been added
// to the log (selected), and those that haven't (unselected).
const partitionOptions = (options = [], selections = []) => {
  const [selected, unselected] = R.partition(
    opt => selections.some(sel => sel.id === opt.id),
    options,
  );
  return { selected, unselected };
};

// Quantity measures are static strings, so no need to make them reactive.
const quantMeasures = [
  'count',
  'length',
  'weight',
  'area',
  'volume',
  'time',
  'temperature',
  'water_content',
  'value',
  'rating',
  'ratio',
  'probability',
];

export default {
  name: 'TasksEdit',
  setup() {
    // LOCAL STATE
    const localAreas = reactive([]);
    const awaitingLocation = ref(false);
    const showAllCategories = ref(false);
    const currentQuant = ref(-1);

    // APP SHELL DATA
    const alert = inject('alert');
    const bundles = inject('bundles');
    const settings = inject('settings');

    // ENTITIES
    const { assets, equipment, locations } = inject('assets');
    const { categories, units } = inject('terms');
    const {
      current, update, save, close,
    } = inject('logs');
    const { quantities } = inject('quantities');
    const computeQuantities = R.map(R.evolve({
      units: u => R.find(R.propEq('id', u.id), units.value)?.name || '',
      value: v => v.decimal || v.numerator / v.denominator,
    }));

    return {
      parseNotes,
      quantMeasures,
      localAreas,
      awaitingLocation,
      showAllCategories,
      currentQuant,
      alert,
      typeLabel: bundles.log?.[current.type]?.label || '',
      settings,
      log: current,
      update,
      save,
      close,
      units,
      quantities: computed(() => computeQuantities(quantities.value)),
      assets: computed(() => partitionOptions(assets.value, current.asset)),
      equipment: computed(() => partitionOptions(equipment.value, current.equipment)),
      locations: computed(() => partitionOptions(locations.value, current.location)),
      categories: computed(() => partitionOptions(categories.value, current.category)),
      appBarActions: computed(() => {
        const logURL = current.url;
        const openInNew = logURL ? [{
          icon: 'icon-open-in-new',
          onClick() { window.open(logURL, '_blank'); },
          text: 'Open in browser',
        }] : [];
        return openInNew;
      }),
      updateNotes(value) {
        update({ notes: { value, format: 'default' } });
      },
      toggleRelationship(relationship, { id, type }) {
        const i = current[relationship].findIndex(e => e.id === id);
        if (i < 0) {
          const changed = current[relationship].concat({ id, type });
          update({ [relationship]: changed });
        } else {
          const changed = [
            ...current[relationship].slice(0, i),
            ...current[relationship].slice(i + 1),
          ];
          update({ [relationship]: changed });
        }
      },
    };
  },

  beforeMount() {
    if (!this.log) {
      this.$router.push({ path: '/tasks' });
    }
  },
  beforeRouteLeave() {
    if (this.log) {
      this.save(this.log);
    }
  },

  // methods: {
  //   updateQuantity(key, value, index) {
  //     const currentQuants = this.log.quantity || [];
  //     const storedVal = (key === 'unit')
  //       ? { id: value, type: 'taxonomy_term--unit' }
  //       : value;
  //     let updatedQuant; let updatedQuants;
  //     if (index >= 0) {
  //       updatedQuant = { ...currentQuants[index], [key]: storedVal };
  //       updatedQuants = [
  //         ...currentQuants.slice(0, index),
  //         updatedQuant,
  //         ...currentQuants.slice(index + 1),
  //       ];
  //     } else {
  //       updatedQuant = {
  //         measure: null,
  //         value: null,
  //         unit: null,
  //         label: null,
  //       };
  //       updatedQuants = [...currentQuants, updatedQuant];
  //     }
  //     this.update({ quantity: updatedQuants });
  //     if (index < 0) {
  //       this.currentQuant = updatedQuants.length - 1;
  //     }
  //   },

  //   removeQuant(index) {
  //     if (this.currentQuant >= index) {
  //       this.currentQuant -= 1;
  //     }
  //     const newQuant = [
  //       ...this.log.quantity.slice(0, index),
  //       ...this.log.quantity.slice(index + 1),
  //     ];
  //     this.update({ quantity: newQuant });
  //   },
  // },
};

</script>

<style scoped>
  textarea {
    resize: vertical;
  }

  .reset-margin {
    margin: 0 0;
  }

  .empty-slot {
    text-align: center;
    color: var(--light);
  }

  .empty-slot button {
    margin: 0.5rem;
    color: var(--light);
  }

  .remove-list-item {
    float: right;
    cursor: pointer;
  }

  #categories {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
  }

  #categories-label {
    flex: 1 0 100%;
  }

  #categories p {
    font-style: italic;
  }

  .show-hide {
    flex: 1 0 100%;
  }

  .show-hide p {
    font-size: 1rem;
  }

  .show-hide svg {
    vertical-align: bottom;
  }

</style>
