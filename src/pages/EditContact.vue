<template>
  <q-page>
    <q-toolbar v-if="showHeader" class="bg-accent text-white">
      <q-btn flat size="sm" round icon="arrow_back_ios" to="/contacts" replace />
      <q-toolbar-title class="text-center text-subtitle1 text-bold">{{ $t('editContact.title') }}</q-toolbar-title>
      <q-btn flat round :loading="adding" icon="more_vert" class="invisible">
        <template v-slot:loading>
          <q-spinner-facebook color="white" />
        </template>
      </q-btn>
    </q-toolbar>
    <div class="column q-pa-md bg-white">
      <q-input
        v-model.trim="contact.address"
        autogrow
        type="text"
        clearable
        :label="$t('contacts.label.address') + ' *'"
      />
      <q-input
        v-model.trim="contact.name"
        autogrow
        clearable
        type="text"
        :label="$t('contacts.label.name') + ' *'"
      />
      <q-input
        v-model.trim="contact.description"
        autogrow
        clearable
        type="text"
        :label="$t('contacts.label.description')"
      />
    </div>
    <div class="row q-pa-md q-mt-md">
      <q-btn
        class="full-width q-mb-md"
        unelevated
        color="primary"
        :disable="!canSave"
        :label="$t('contacts.btn.save')"
        @click="onSave"
      />
      <q-btn
        v-if="id!=='0'"
        class="full-width"
        unelevated
        color="negative"
        :label="$t('contacts.btn.delete')"
        @click="onDelete(contact.id)"
      />
    </div>
    <q-inner-loading :showing="adding">
      <q-spinner-facebook size="50px" color="accent" />
    </q-inner-loading>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api';
import { useConfig } from '../compositions/config';
import { useContacts, Contact } from '../compositions/account';
import { useApi } from '../compositions/api';
import { Notify, Dialog } from 'quasar';
import { i18n } from '../boot/i18n';
export default defineComponent({
  name: 'EditContact',
  props: {
    id: {
      required: true,
      type: String,
    },
  },
  setup(props) {
    const id = computed(() => Number(props.id));
    const contact = ref(new Contact('', '', '', id.value));

    if (id.value) {
      const res = useContacts().value.find((c) => c.id === id.value);
      if (!!res) contact.value = { ...res };
    }

    const canSave = computed(() => {
      return contact.value.address?.length && contact.value.name?.length;
      // return true;
    });

    const adding = ref(false);

    const onSave = async () => {
      adding.value = true;
      try {
        await useApi().addContact(contact.value);
      } catch (e) {
        Notify.create({
          message: (e as Error).message,
          type: 'negative',
          timeout: 3000,
        });
        return;
      }
      adding.value = false;
      Notify.create({
        message: i18n.t('contacts.msg.added').toString(),
        type: 'positive',
        timeout: 3000,
      });
      window.history.back();
    };

    const onDelete = (contactId: number) => {
      Dialog.create({
        title: i18n.t('editContact.label.confirm').toString(),
        message: i18n.t('editContact.msg.confirmDelete').toString(),
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        adding.value = true;
        try {
          await useApi().deleteContact(contactId);
        } catch (e) {
          Notify.create({
            message: (e as Error).message,
            type: 'negative',
            timeout: 3000,
          });
          return;
        }
        adding.value = false;
        Notify.create({
          message: i18n.t('contacts.msg.deleted').toString(),
          type: 'positive',
          timeout: 3000,
        });
        window.history.back();
      });
    };

    return {
      showHeader: useConfig().showHeader,
      contact,
      canSave,
      onSave,
      onDelete,
      adding,
    };
  },
});
</script>
