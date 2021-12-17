<template>
  <q-page >
      <q-input standout="bg-teal text-white" v-model="text" label="Nama Ladang" />
      <q-input standout="bg-teal text-white" v-model="text" label="Nama Pengguna" />
      <q-input standout="bg-teal text-white" v-model="text" label="Kata Laluan" />
      <q-btn color="secondary" label="Log Masuk" :to="{ path: 'dashboard' }" />
   </q-page>
</template>

<script lang="ts">
import { Todo, Meta } from 'components/models';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const todos = ref<Todo[]>([
      {
        id: 1,
        content: 'ct1'
      },
      {
        id: 2,
        content: 'ct2'
      },
      {
        id: 3,
        content: 'ct3'
      },
      {
        id: 4,
        content: 'ct4'
      },
      {
        id: 5,
        content: 'ct5'
      }
    ]);
    const meta = ref<Meta>({
      totalCount: 1200
    });
    return { todos, meta };
  }
});
</script>
