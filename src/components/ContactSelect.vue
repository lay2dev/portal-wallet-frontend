<template>
  <q-card style="border-top-left-radius: 7%;border-top-right-radius: 7%">
    <q-toolbar class="bg-accent text-white">
      <q-btn
        flat
        round
        dense
        icon="close"
        v-close-popup
      />
      <q-toolbar-title>
        <center class="text-subtitle1"> {{$t('contacts.title')}} </center>
      </q-toolbar-title>
      <q-btn
        flat
        round
        dense
        icon="add"
        to="contacts/0"
      />
    </q-toolbar>
    <q-card-section>
      <div
        v-for="contact in contacts"
        :key="contact.id"
      >
        <q-item
          clickable
          v-close-popup
          @click="onSelect(contact)"
        >
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
  </q-card>
</template>

<script lang="ts">
  import { defineComponent, onMounted } from '@vue/composition-api';
  import { useContacts, loadContacts, Contact } from '../compositions/account';

  export default defineComponent({
    name: 'ContactSelect',
    setup(props, ctx) {
      onMounted(() => {
        void loadContacts();
      });

      const contacts = useContacts();

      const onSelect = (contact: Contact) =>
        ctx.emit('onSelect', contact.address.trim());

      return {
        contacts,
        onSelect
      };
    }
  });
</script>
