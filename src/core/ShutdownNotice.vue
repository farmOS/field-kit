<template>
  <div class="module-container">
    <farm-main :paddingTop="['xl', 'xxl']" :paddingX="['l', 'xxl']">

      <farm-stack space="l">
        <farm-card>
          <h3 class="card-title">Shutdown Notice</h3>
          <p class="card-text">
            farmos.app is down for maintenance in preparation for the upcoming
            release of Field Kit Version 2. If you wish to continue using
            Version 1, please go to
            <a href="https://v1.farmos.app" target="_blank">
              v1.farmos.app
            </a>
            to reinstall. For more information, visit
            <a href="https://farmos.discourse.group/t/migrating-from-farmos-app-to-v1-farmos-app/791" target="_blank">
              the farmOS forum
            </a>.
          </p>
        </farm-card>
      </farm-stack>

    </farm-main>
  </div>
</template>

<script>

export default {
  name: 'ShutdownNotice',
};
</script>

<style scoped>

</style>
