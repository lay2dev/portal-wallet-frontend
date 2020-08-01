<template>
  <q-page>
    <q-toolbar v-if="showHeader" class="bg-accent text-white">
      <q-btn flat size="sm" round icon="arrow_back_ios" to="/" replace />
      <q-toolbar-title class="text-center text-subtitle1 text-bold">{{ $t('contacts.title') }}</q-toolbar-title>
      <q-btn flat round dense icon="add" to="contacts/0" />
    </q-toolbar>
    <div>
      <!-- <q-scroll-area class="fit position-relative"> -->
      <div class="q-pa-sm">
        <q-list class="q-gutter-sm">
          <q-item
            v-for="(contact, index) in contacts"
            :key="index"
            class="bg-white q-pa-md"
            clickable
            v-ripple
            @click="gotoEdit(contact)"
          >
            <!-- <q-item-section avatar>
                <q-icon :name="menuItem.icon" />
            </q-item-section>-->
            <q-item-section>
              <q-item-label class="text-h6">{{ contact.name }}</q-item-label>
              <q-item-label class="text-dark">{{ truncatedAddress(contact.address, 28) }}</q-item-label>
              <q-item-label caption>{{ contact.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <q-inner-loading :showing="contactsLoading">
        <q-spinner-facebook size="50px" color="accent" />
      </q-inner-loading>
      <!-- </q-scroll-area> -->
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from '@vue/composition-api';
import { useConfig } from '../compositions/config';
import {
  useContacts,
  Contact,
  loadContacts,
  truncatedAddress,
} from '../compositions/account';

export default defineComponent({
  name: 'Contacts',
  setup(props, { root }) {
    const contacts = useContacts();
    const contactsLoading = ref(false);

    onMounted(async () => {
      contactsLoading.value = true;
      await loadContacts();
      contactsLoading.value = false;
    });

    const gotoEdit = (contact: Contact) => {
      void root.$router.push(`contacts/${contact.id}`);
    };

    return {
      showHeader: useConfig().showHeader,
      contacts,
      contactsLoading,
      gotoEdit,
      truncatedAddress,
    };
  },
});
</script>
