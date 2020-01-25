<template functional>
  <div class="widget">
    <div class="card">
      <div class="card-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>

  .card {
    max-width: 18rem;
  }

  .card-group > .card {
    margin-bottom: 0;
  }

  .card-body {
    color: var(--gray-dark);
  }

  .card-row-1 {
    display: flex;
    flex-flow: row nowrap;
  }

  .card-row-1 h5 {
    font-weight: 700;
  }

  .card-row-2 {
    display: flex;
    flex-flow: row nowrap;
  }

  .card-row-3 {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
  }

  .card-body p {
    margin-bottom: 0.5rem;
  }

</style>
