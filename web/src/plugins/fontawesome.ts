import Vue from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faCaretDown, faCaretRight)
Vue.component('fontawesome', FontAwesomeIcon)