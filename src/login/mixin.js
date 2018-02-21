export default {
  created: function () {
    if (this.$store.state.user.isLoggedIn) {
      return
    }
    this.$router.push({path: 'login'})
  },
  computed: {
    headerText: function () {
      if (!this.$store.state.user.isLoggedIn) {
        return 'Please enter your farmOS credentials';
      }
      return 'Welcome ' + this.$store.state.user.name + '!';
    }
  }
}
