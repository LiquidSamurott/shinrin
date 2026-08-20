<script setup lang="ts">
import { computed, ref } from "vue";

import {
  Bot,
  Globe,
  Link,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Search,
  ExternalLink,
} from "@lucide/vue";

import { invoke } from "@tauri-apps/api/core";

import { useSettingsStore } from "../../stores/settings";

const settings = useSettingsStore();

/*
============================================================
STATE
============================================================
*/

const testingConnection = ref(false);
const testingSearch = ref(false);

const connectionStatus = ref<
  "idle" | "success" | "error"
>("idle");

const searchStatus = ref<
  "idle" | "success" | "error"
>("idle");

const connectionMessage = ref("");
const searchMessage = ref("");

/*
============================================================
WEB SEARCH ENABLED
============================================================
*/

const webSearchEnabled = computed({
  get: () =>
    settings.settings.webSearchEnabled,

  set: (value: boolean) => {
    settings.settings.webSearchEnabled =
      value;

    resetConnectionStatus();
    resetSearchStatus();
  },
});

/*
============================================================
SEARXNG URL
============================================================
*/

const searxngUrl = computed({
  get: () =>
    settings.settings.searxngUrl,

  set: (value: string) => {
    settings.settings.searxngUrl =
      value;

    resetConnectionStatus();
    resetSearchStatus();
  },
});

/*
============================================================
VALIDATE URL
============================================================
*/

function validateUrl(
  url: string
): boolean {
  try {
    const parsed =
      new URL(url);

    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    );
  } catch {
    return false;
  }
}

/*
============================================================
GET URL
============================================================
*/

function getValidatedUrl():
  | string
  | null {

  const url =
    searxngUrl.value.trim();

  if (!url) {
    connectionStatus.value =
      "error";

    connectionMessage.value =
      "Please enter a SearXNG URL first.";

    return null;
  }

  if (!validateUrl(url)) {
    connectionStatus.value =
      "error";

    connectionMessage.value =
      "Please enter a valid HTTP or HTTPS URL.";

    return null;
  }

  return url;
}

/*
============================================================
TEST SERVER CONNECTION
============================================================
*/

async function testConnection() {
  resetConnectionStatus();

  const url =
    getValidatedUrl();

  if (!url) {
    return;
  }

  testingConnection.value =
    true;

  try {
    /*
    --------------------------------------------------------
    Rust command returns:
        Result<String, String>
    --------------------------------------------------------

    Therefore invoke() returns a plain string on success.
    --------------------------------------------------------
    */

    const result =
      await invoke<string>(
        "test_searxng_connection",
        {
          searxngUrl: url,
        }
      );

    connectionStatus.value =
      "success";

    connectionMessage.value =
      result ||
      "SearXNG server is reachable.";

  } catch (error) {

    console.error(
      "SearXNG connection test failed:",
      error
    );

    connectionStatus.value =
      "error";

    connectionMessage.value =
      String(error);

  } finally {
    testingConnection.value =
      false;
  }
}

/*
============================================================
TEST SEARCH API
============================================================
*/

async function testSearch() {
  resetSearchStatus();

  const url =
    searxngUrl.value.trim();

  if (!url) {
    searchStatus.value =
      "error";

    searchMessage.value =
      "Please enter a SearXNG URL first.";

    return;
  }

  if (!validateUrl(url)) {
    searchStatus.value =
      "error";

    searchMessage.value =
      "Please enter a valid HTTP or HTTPS URL.";

    return;
  }

  testingSearch.value =
    true;

  try {

    /*
    --------------------------------------------------------
    This specifically tests:

        GET /search
        ?q=test
        &format=json
        &language=en
        &safesearch=2
        &categories=general
    --------------------------------------------------------
    */

    const result =
      await invoke<string>(
        "test_searxng_search",
        {
          searxngUrl: url,
        }
      );

    searchStatus.value =
      "success";

    searchMessage.value =
      result ||
      "SearXNG search API is available.";

  } catch (error) {

    console.error(
      "SearXNG search test failed:",
      error
    );

    searchStatus.value =
      "error";

    searchMessage.value =
      String(error);

  } finally {
    testingSearch.value =
      false;
  }
}

/*
============================================================
SAVE
============================================================
*/

async function save() {
  try {

    await settings.saveSettings();

  } catch (error) {

    console.error(
      "Failed to save AI settings:",
      error
    );

  }
}

/*
============================================================
RESET CONNECTION STATUS
============================================================
*/

function resetConnectionStatus() {
  connectionStatus.value =
    "idle";

  connectionMessage.value =
    "";
}

/*
============================================================
RESET SEARCH STATUS
============================================================
*/

function resetSearchStatus() {
  searchStatus.value =
    "idle";

  searchMessage.value =
    "";
}

/*
============================================================
RESET EVERYTHING
============================================================
*/

function resetTests() {
  resetConnectionStatus();
  resetSearchStatus();
}
</script>

<template>

  <section class="space-y-6">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <div>

      <div
        class="flex items-center gap-3"
      >

        <div
          class="flex h-10 w-10
                 items-center justify-center
                 rounded-xl
                 bg-emerald-500/10"
        >

          <Bot
            class="h-5 w-5
                   text-emerald-400"
          />

        </div>

        <div>

          <h2
            class="text-lg
                   font-semibold
                   text-white"
          >
            AI Settings
          </h2>

          <p
            class="text-sm
                   text-gray-400"
          >
            Configure Shinrin AI and
            optional web search.
          </p>

        </div>

      </div>

    </div>


    <!-- =====================================================
         LOCAL AI
    ====================================================== -->

    <div
      class="rounded-2xl
             border border-white/10
             bg-white/[0.03]
             p-5"
    >

      <div
        class="flex items-start gap-4"
      >

        <div
          class="flex h-10 w-10
                 shrink-0
                 items-center justify-center
                 rounded-xl
                 bg-purple-500/10"
        >

          <Bot
            class="h-5 w-5
                   text-purple-400"
          />

        </div>

        <div
          class="min-w-0 flex-1"
        >

          <h3
            class="font-medium
                   text-white"
          >
            Shinrin AI
          </h3>

          <p
            class="mt-1
                   text-sm
                   leading-6
                   text-gray-400"
          >
            Shinrin AI runs locally
            on your device. Web search
            is optional and can be
            disabled whenever you want
            a completely offline
            experience.
          </p>

          <div
            class="mt-4
                   flex items-center gap-2
                   text-xs
                   text-emerald-400"
          >

            <CheckCircle2
              class="h-4 w-4"
            />

            <span>
              Local AI enabled
            </span>

          </div>

        </div>

      </div>

    </div>


    <!-- =====================================================
         WEB SEARCH
    ====================================================== -->

    <div
      class="rounded-2xl
             border border-white/10
             bg-white/[0.03]
             p-5"
    >

      <!-- =================================================
           WEB SEARCH HEADER
      ================================================== -->

      <div
        class="flex items-start
               justify-between
               gap-4"
      >

        <div
          class="flex items-start
                 gap-4"
        >

          <div
            class="flex h-10 w-10
                   shrink-0
                   items-center
                   justify-center
                   rounded-xl
                   bg-sky-500/10"
          >

            <Globe
              class="h-5 w-5
                     text-sky-400"
            />

          </div>

          <div>

            <h3
              class="font-medium
                     text-white"
            >
              Web Search
            </h3>

            <p
              class="mt-1
                     text-sm
                     text-gray-400"
            >
              Allow Shinrin AI to
              retrieve information
              through SearXNG.
            </p>

          </div>

        </div>


        <!-- =================================================
             TOGGLE
        ================================================== -->

        <button
          type="button"
          role="switch"
          :aria-checked="
            webSearchEnabled
          "
          @click="
            webSearchEnabled =
              !webSearchEnabled
          "
          class="relative
                 h-6 w-11
                 shrink-0
                 rounded-full
                 transition-colors"
          :class="
            webSearchEnabled
              ? 'bg-emerald-500'
              : 'bg-gray-700'
          "
        >

          <span
            class="absolute
                   top-1
                   h-4 w-4
                   rounded-full
                   bg-white
                   shadow-sm
                   transition-transform"
            :class="
              webSearchEnabled
                ? 'translate-x-6'
                : 'translate-x-1'
            "
          />

        </button>

      </div>


      <!-- =================================================
           CONFIGURATION
      ================================================== -->

      <div
        v-if="webSearchEnabled"
        class="mt-6 space-y-5"
      >

        <!-- ===============================================
             URL
        ================================================ -->

        <div>

          <label
            class="mb-2
                   block
                   text-sm
                   font-medium
                   text-gray-300"
          >
            SearXNG URL
          </label>

          <div
            class="relative"
          >

            <Link
              class="absolute
                     left-3
                     top-1/2
                     h-4 w-4
                     -translate-y-1/2
                     text-gray-500"
            />

            <input
              v-model="searxngUrl"
              type="url"
              placeholder="https://searx.example.com"
              @input="resetTests"
              class="w-full
                     rounded-xl
                     border
                     border-white/10
                     bg-black/20
                     py-2.5
                     pl-10
                     pr-4
                     text-sm
                     text-white
                     outline-none
                     transition
                     placeholder:text-gray-600
                     focus:border-emerald-500/50
                     focus:ring-2
                     focus:ring-emerald-500/10"
            />

          </div>

          <p
            class="mt-2
                   text-xs
                   text-gray-500"
          >
            Enter the address of your
            SearXNG instance, for example
            <span class="text-gray-400">
              https://opnxng.com
            </span>.
          </p>

        </div>


        <!-- ===============================================
             TEST BUTTONS
        ================================================ -->

        <div
          class="flex flex-wrap
                 items-center
                 gap-3"
        >

          <!-- SERVER TEST -->

          <button
            type="button"
            :disabled="
              testingConnection ||
              testingSearch
            "
            @click="
              testConnection
            "
            class="inline-flex
                   items-center
                   gap-2
                   rounded-xl
                   border
                   border-white/10
                   bg-white/[0.05]
                   px-4
                   py-2.5
                   text-sm
                   font-medium
                   text-gray-200
                   transition
                   hover:bg-white/[0.08]
                   disabled:cursor-not-allowed
                   disabled:opacity-50"
          >

            <Loader2
              v-if="testingConnection"
              class="h-4 w-4
                     animate-spin"
            />

            <RefreshCw
              v-else
              class="h-4 w-4"
            />

            {{
              testingConnection
                ? "Testing..."
                : "Test Server"
            }}

          </button>


          <!-- SEARCH API TEST -->

          <button
            type="button"
            :disabled="
              testingConnection ||
              testingSearch
            "
            @click="
              testSearch
            "
            class="inline-flex
                   items-center
                   gap-2
                   rounded-xl
                   border
                   border-sky-500/20
                   bg-sky-500/10
                   px-4
                   py-2.5
                   text-sm
                   font-medium
                   text-sky-300
                   transition
                   hover:bg-sky-500/15
                   disabled:cursor-not-allowed
                   disabled:opacity-50"
          >

            <Loader2
              v-if="testingSearch"
              class="h-4 w-4
                     animate-spin"
            />

            <Search
              v-else
              class="h-4 w-4"
            />

            {{
              testingSearch
                ? "Testing..."
                : "Test Search API"
            }}

          </button>


          <!-- OPEN INSTANCE -->

          <a
            v-if="searxngUrl"
            :href="searxngUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex
                   items-center
                   gap-1.5
                   text-xs
                   text-gray-500
                   transition
                   hover:text-gray-300"
          >

            Open SearXNG

            <ExternalLink
              class="h-3.5 w-3.5"
            />

          </a>

        </div>


        <!-- ===============================================
             SERVER STATUS
        ================================================ -->

        <div
          v-if="
            connectionStatus !==
            'idle'
          "
          class="flex items-start
                 gap-3
                 rounded-xl
                 border
                 p-3"
          :class="
            connectionStatus ===
            'success'
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-red-500/20 bg-red-500/5'
          "
        >

          <CheckCircle2
            v-if="
              connectionStatus ===
              'success'
            "
            class="mt-0.5
                   h-4 w-4
                   shrink-0
                   text-emerald-400"
          />

          <XCircle
            v-else
            class="mt-0.5
                   h-4 w-4
                   shrink-0
                   text-red-400"
          />

          <div
            class="min-w-0"
          >

            <p
              class="text-sm
                     font-medium"
              :class="
                connectionStatus ===
                'success'
                  ? 'text-emerald-400'
                  : 'text-red-400'
              "
            >
              {{
                connectionStatus ===
                "success"
                  ? "Server reachable"
                  : "Server connection failed"
              }}
            </p>

            <p
              class="mt-1
                     break-words
                     text-xs
                     text-gray-400"
            >
              {{ connectionMessage }}
            </p>

          </div>

        </div>


        <!-- ===============================================
             SEARCH API STATUS
        ================================================ -->

        <div
          v-if="
            searchStatus !==
            'idle'
          "
          class="flex items-start
                 gap-3
                 rounded-xl
                 border
                 p-3"
          :class="
            searchStatus ===
            'success'
              ? 'border-sky-500/20 bg-sky-500/5'
              : 'border-red-500/20 bg-red-500/5'
          "
        >

          <CheckCircle2
            v-if="
              searchStatus ===
              'success'
            "
            class="mt-0.5
                   h-4 w-4
                   shrink-0
                   text-sky-400"
          />

          <XCircle
            v-else
            class="mt-0.5
                   h-4 w-4
                   shrink-0
                   text-red-400"
          />

          <div
            class="min-w-0"
          >

            <p
              class="text-sm
                     font-medium"
              :class="
                searchStatus ===
                'success'
                  ? 'text-sky-400'
                  : 'text-red-400'
              "
            >
              {{
                searchStatus ===
                "success"
                  ? "Search API available"
                  : "Search API unavailable"
              }}
            </p>

            <p
              class="mt-1
                     break-words
                     text-xs
                     text-gray-400"
            >
              {{ searchMessage }}
            </p>

          </div>

        </div>


        <!-- ===============================================
             EXPLANATION
        ================================================ -->

        <div
          class="rounded-xl
                 border
                 border-white/5
                 bg-black/10
                 p-4"
        >

          <div
            class="flex
                   items-start
                   gap-3"
          >

            <Globe
              class="mt-0.5
                     h-4 w-4
                     shrink-0
                     text-gray-500"
            />

            <div>

              <p
                class="text-xs
                       font-medium
                       text-gray-300"
              >
                Connection vs Search API
              </p>

              <p
                class="mt-1
                       text-xs
                       leading-5
                       text-gray-500"
              >
                Test Server checks whether
                the SearXNG instance itself
                is reachable. Test Search API
                additionally checks whether
                the instance permits the
                JSON search endpoint used by
                Shinrin.
              </p>

            </div>

          </div>

        </div>

      </div>


      <!-- =================================================
           DISABLED
      ================================================== -->

      <div
        v-else
        class="mt-5
               flex items-center
               gap-3
               rounded-xl
               border
               border-white/5
               bg-black/10
               p-4"
      >

        <Globe
          class="h-5 w-5
                 text-gray-600"
        />

        <p
          class="text-sm
                 text-gray-500"
        >
          Web search is disabled.
          Shinrin AI will operate
          entirely locally.
        </p>

      </div>

    </div>


    <!-- =====================================================
         SAVE
    ====================================================== -->

    <div
      class="flex justify-end"
    >

      <button
        type="button"
        :disabled="
          settings.saving
        "
        @click="save"
        class="inline-flex
               items-center
               gap-2
               rounded-xl
               bg-emerald-500
               px-5
               py-2.5
               text-sm
               font-semibold
               text-white
               transition
               hover:bg-emerald-600
               disabled:cursor-not-allowed
               disabled:opacity-50"
      >

        <Loader2
          v-if="
            settings.saving
          "
          class="h-4 w-4
                 animate-spin"
        />

        {{
          settings.saving
            ? "Saving..."
            : "Save Changes"
        }}

      </button>

    </div>


    <!-- =====================================================
         SETTINGS ERROR
    ====================================================== -->

    <p
      v-if="settings.error"
      class="text-sm
             text-red-400"
    >
      {{ settings.error }}
    </p>

  </section>

</template>