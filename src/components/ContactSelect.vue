<template>
  <q-card style="border-top-left-radius: 7%;border-top-right-radius: 7%">
    <q-toolbar class="bg-accent text-white">
      <q-btn flat round dense icon="close" v-close-popup />
      <q-toolbar-title>
        <center class="text-subtitle1">{{$t('contacts.title')}}</center>
      </q-toolbar-title>
      <q-btn flat round dense icon="add" to="contacts/0" />
    </q-toolbar>
    <q-card-section v-if="contacts && contacts.length">
      <div v-for="contact in contacts" :key="contact.id">
        <q-item clickable v-close-popup @click="onSelect(contact)">
          <q-item-section>
            <div class="text-body1 text-accent">{{contact.name}}</div>
            <div
              class="text-caption"
              style="word-break: break-word; line-height: 1.2em"
            >{{ contact.address }}</div>
            <div
              class="text-caption text-grey"
              style="word-break: break-word"
            >{{contact.description}}</div>
          </q-item-section>
        </q-item>
        <q-separator />
      </div>
    </q-card-section>
    <q-card-section class="text-center text-grey" v-else>
      <div class="text-subtitle2">{{$t('contacts.msg.empty')}}</div>
      <q-icon name="space_bar" size="5em" />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, onMounted } from '@vue/composition-api';
import { useContacts, loadContacts, Contact } from '../compositions/account';
import GTM from '../compositions/gtm';

export default defineComponent({
  name: 'ContactSelect',
  setup(props, ctx) {
    onMounted(() => {
      void loadContacts();
      GTM.logEvent({
        category: 'Actions',
        action: 'show-dialog',
        label: 'contact-select',
        value: new Date().getTime(),
      });
    });

    const contacts = useContacts();

    const onSelect = (contact: Contact) =>
      ctx.emit('onSelect', contact.address.trim());

    return {
      contacts,
      onSelect,
    };
  },
});
</script>
