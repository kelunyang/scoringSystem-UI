<template>
  <v-img
    :lazy-src="avaImg"
    :max-height="sizeObj"
    :max-width="sizeObj"
    :src="avaImg"
  ></v-img>
</template>
<script>
  import { createAvatar } from '@dicebear/avatars';
  import * as male from '@dicebear/avatars-male-sprites';
  import * as female from '@dicebear/avatars-female-sprites';
  import * as human from '@dicebear/avatars-human-sprites';
  import * as bottts from '@dicebear/avatars-bottts-sprites';
  export default {
    name: 'Avatar',
    props: {
      user: Object,
      size: Number
    },
    computed: {
      avaImg: function() {
        let type = male;
        if(this.userObj.types === "bottts") {
          type = bottts;
        }
        if(this.userObj.types === "human") {
          type = human;
        }
        if(this.userObj.types === "female") {
          type = female;
        }
        return createAvatar(type, {
          seed: encodeURIComponent(this.userObj.name + this.userObj.unit + this.userObj._id),
          dataUri: true,
          width: this.size,
          height: this.size
        });
      }
    },
    watch: {
      user: function() {
        this.userObj = this.user;
      },
      size: function() {
        this.sizeObj = this.size;
      }
    },
    mounted () {
      this.userObj = this.user;
      this.sizeObj = this.size;
    },
    data() {
      return {
        userObj: {
          _id: 'notSet',
          types: 'bottts',
          name: 'notSet',
          unit: 'notSet'
        },
        sizeObj: 48
      }
    }
  }
</script>