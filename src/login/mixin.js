export default {
  created() {
    if (this.$store.state.user.isLoggedIn) {
      this.$store.commit('changeGreeting', `Welcome ${this.$store.state.user.name}!`);
      return;
    }
    this.$store.commit('changeGreeting', 'Please enter your farmOS credentials');
    this.$router.push({ path: 'login' });
  },
};
