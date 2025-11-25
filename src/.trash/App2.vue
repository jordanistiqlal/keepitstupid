<script setup lang="ts">
import { ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import Header from './components/Header.vue';

interface Task {
  id: string;
  title: string;
  description?: string;
}

const quadrants = ref({
  urgentImportant: [{ id: '1', title: 'Deadline Project', description: 'Submit today' }] as Task[],
  notUrgentImportant: [{ id: '2', title: 'Planning Sprint', description: 'Next week' }] as Task[],
  urgentNotImportant: [] as Task[],
  notUrgentNotImportant: [] as Task[]
});

// Function to add new task
const addTask = (quadrant: keyof typeof quadrants.value) => {
  const title = prompt('Task title:');
  if (title) {
    quadrants.value[quadrant].push({
      id: Date.now().toString(),
      title,
      description: ''
    });
  }
};
</script>

<template>
  <Header />

  <div class="grid grid-cols-2 px-2 gap-0">
    <!-- Quadrant 1: Urgent & Important -->
    <div class="border-dashed border-b border-r min-h-[43vh] relative p-4 pt-10">
      <span class="absolute top-2 left-2 font-semibold text-red-600">
        Important and Urgent
      </span>
      <button 
        @click="addTask('urgentImportant')"
        class="absolute top-2 right-2 text-sm bg-red-100 px-2 py-1 rounded hover:bg-red-200"
      >
        + Add
      </button>
      
      <VueDraggable
        v-model="quadrants.urgentImportant"
        group="tasks"
        class="space-y-2 min-h-[200px]"
      >
        <div
          v-for="task in quadrants.urgentImportant"
          :key="task.id"
          class="bg-white border rounded-lg p-3 shadow-sm cursor-move hover:shadow-md transition-shadow"
        >
          <h3 class="font-medium">{{ task.title }}</h3>
          <p class="text-sm text-gray-600" v-if="task.description">
            {{ task.description }}
          </p>
        </div>
      </VueDraggable>
    </div>

    <!-- Quadrant 2: Not Urgent but Important -->
    <div class="border-dashed border-b border-l min-h-[43vh] relative p-4 pt-10">
      <span class="absolute top-2 right-2 font-semibold text-blue-600">
        Important, but not Urgent
      </span>
      <button 
        @click="addTask('notUrgentImportant')"
        class="absolute top-2 left-2 text-sm bg-blue-100 px-2 py-1 rounded hover:bg-blue-200"
      >
        + Add
      </button>
      
      <VueDraggable
        v-model="quadrants.notUrgentImportant"
        group="tasks"
        class="space-y-2 min-h-[200px]"
      >
        <div
          v-for="task in quadrants.notUrgentImportant"
          :key="task.id"
          class="bg-white border rounded-lg p-3 shadow-sm cursor-move hover:shadow-md transition-shadow"
        >
          <h3 class="font-medium">{{ task.title }}</h3>
          <p class="text-sm text-gray-600" v-if="task.description">
            {{ task.description }}
          </p>
        </div>
      </VueDraggable>
    </div>

    <!-- Quadrant 3: Urgent but Not Important -->
    <div class="border-dashed border-t border-r min-h-[43vh] relative p-4 pb-10">
      <span class="absolute bottom-2 left-2 font-semibold text-yellow-600">
        Urgent, but not Important
      </span>
      <button 
        @click="addTask('urgentNotImportant')"
        class="absolute top-2 left-2 text-sm bg-yellow-100 px-2 py-1 rounded hover:bg-yellow-200"
      >
        + Add
      </button>
      
      <VueDraggable
        v-model="quadrants.urgentNotImportant"
        group="tasks"
        class="space-y-2 min-h-[200px]"
      >
        <div
          v-for="task in quadrants.urgentNotImportant"
          :key="task.id"
          class="bg-white border rounded-lg p-3 shadow-sm cursor-move hover:shadow-md transition-shadow"
        >
          <h3 class="font-medium">{{ task.title }}</h3>
          <p class="text-sm text-gray-600" v-if="task.description">
            {{ task.description }}
          </p>
        </div>
      </VueDraggable>
    </div>

    <!-- Quadrant 4: Not Urgent and Not Important -->
    <div class="border-dashed border-t border-l min-h-[43vh] relative p-4 pb-10">
      <span class="absolute bottom-2 right-2 font-semibold text-gray-600">
        Not Urgent and Not Important
      </span>
      <button 
        @click="addTask('notUrgentNotImportant')"
        class="absolute top-2 right-2 text-sm bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
      >
        + Add
      </button>
      
      <VueDraggable
        v-model="quadrants.notUrgentNotImportant"
        group="tasks"
        class="space-y-2 min-h-[200px]"
      >
        <div
          v-for="task in quadrants.notUrgentNotImportant"
          :key="task.id"
          class="bg-white border rounded-lg p-3 shadow-sm cursor-move hover:shadow-md transition-shadow"
        >
          <h3 class="font-medium">{{ task.title }}</h3>
          <p class="text-sm text-gray-600" v-if="task.description">
            {{ task.description }}
          </p>
        </div>
      </VueDraggable>
    </div>
  </div>
</template>