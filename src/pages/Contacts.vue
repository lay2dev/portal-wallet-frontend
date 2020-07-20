<template>
  <q-page>
    <q-toolbar
      v-if="showHeader"
      class="bg-white text-accent"
    >
      <q-btn
        flat
        size="sm"
        round
        icon="arrow_back_ios"
        to="/send"
        replace
      />
      <q-toolbar-title class="text-center text-subtitle1 text-bold">
        {{ $t('contacts.title') }}
      </q-toolbar-title>
      <q-btn
        flat
        round
        :loading="adding"
        icon="more_vert"
        class="invisible"
      >
        <template v-slot:loading>
          <q-spinner-facebook color="white" />
        </template>
      </q-btn>
    </q-toolbar>
    <div class="column q-pa-md bg-white">
      <q-input
        v-model.trim="contact.address"
        type="text"
        :placeholder="$t('contacts.label.address')"
      />
      <q-input
        v-model.trim="contact.name"
        type="text"
        :placeholder="$t('contacts.label.name')"
      />
      <q-input
        v-model.trim="contact.description"
        type="text"
        :placeholder="$t('contacts.label.description')"
      />
    </div>
    <div class="row q-pa-md q-mt-md">
      <q-btn
        class="full-width"
        unelevated
        color="primary"
        :label="$t('contacts.btn.save')"
        @click="onSave"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
  import { defineComponent, computed, ref } from '@vue/composition-api';
  import { useConfig } from '../compositions/config';
  import { useContacts, Contact } from '../compositions/account';
  import { useApi } from '../compositions/api';
  import { Notify } from 'quasar';
  import { i18n } from '../boot/i18n';
  export default defineComponent({
    name: 'Contacts',
    props: {
      id: {
        required: true,
        type: String
      }
    },
    setup(props) {
      const id = computed(() => Number(props.id));
      const contact = ref(new Contact('', '', '', id.value));

      if (id.value) {
        const res = useContacts().value.find(c => c.id === id.value);
        if (res instanceof Contact) contact.value = res;
      }

      const adding = ref(false);

      const onSave = async () => {
        adding.value = true;
        await useApi().addContact(contact.value);
        adding.value = false;
        Notify.create({
          message: i18n.t('contacts.msg.added').toString(),
          type: 'positive',
          timeout: 3000
        });
        window.history.back();
      };

      return {
        showHeader: useConfig().showHeader,
        contact,
        onSave,
        adding
      };
    }
  });
</script>
