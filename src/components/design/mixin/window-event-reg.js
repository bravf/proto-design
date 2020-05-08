export default {
  data () {
    return {
      windowEventListener: {},
    }
  },
  methods: {
    windowEventAdd (
      type, 
      f
    ) {
      window.addEventListener(type, f)
      if (!(type in this.windowEventListener)){
        this.windowEventListener[type] = []
      }
      this.windowEventListener[type].push(f)
    }
  },
  beforeDestroy () {
    for (let type in this.windowEventListener){
      this.windowEventListener[type].forEach(f => {
        window.removeEventListener(type, f)
      })
    }
  },
}