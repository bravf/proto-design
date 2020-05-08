<script>
import jsx from 'vue-jsx'
let { div } = jsx
export default {
  name: 'index',
  methods: {
  },
  render (h) {
    jsx.h = h
    return div('hello, world')
  }
}
</script>