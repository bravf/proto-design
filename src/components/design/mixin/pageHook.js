export default {
  methods: {
    _onPageShow () {},
    _onPageHide () {},
  },
  watch: {
    '$route' (from ,to) {
      if (from.path === to.path) {
        this._onPageShow()
      }
      else {
        this._onPageHide()
      }
    }
  },
  mounted () {
    this._onPageShow()
  },
  beforeDestroy () {
    this._onPageHide()
  }
}