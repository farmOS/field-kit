<template>
  <div class="not-ready">
    <farm-stack align="center" space="s">
      <img src="/icons/icon-72x72.png" alt="farmOS leaf icon">
      <farm-text as="span" size="l">Getting ready...</farm-text>
    </farm-stack>
  </div>
</template>

<script>
export default {
  name: 'NotReady',
};
</script>

<style>
.not-ready {
  height: 100vh;
  padding-top: calc(50vh - 48px);
}
.not-ready img {
  height: 48px;
}
.not-ready span {
  -webkit-animation: pulse 1250ms infinite;
  animation: pulse 1250ms infinite;
}
@keyframes pulse {
  from { opacity: 1; }
  50% { opacity: .5; }
  to { opacity: 1; }
}
@-webkit-keyframes pulse {
  from { opacity: 1; }
  50% { opacity: .5; }
  to { opacity: 1; }
}
</style>
