export default {
  created() {
    if (this.$store.state.user.isLoggedIn) {
      return;
    }
    this.$router.push({ path: 'login' });
  },
};
