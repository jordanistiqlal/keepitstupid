<script setup lang="ts">
import { ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import Swal from 'sweetalert2';
import csvToJson from './Utils/csvtojson';
import trash from './assets/trash.svg';
import edit from './assets/edit.svg';

interface Task{
 id: string;
 title: string;
 description?: string;
 type?: string;
}

const quadrants = ref({
  urgentImportant: [] as Task[],
  notUrgentImportant: [] as Task[],
  urgentNotImportant: [] as Task[],
  notUrgentNotImportant: [] as Task[],
})

const addTask = (quadrant: keyof typeof quadrants.value) =>{
  Swal.fire({
    title: `TAMBAH DATA ${quadrant.toUpperCase()}`,
    html: `
      <div class="flex flex-col flex-1">
        <input id="swal-title" value="" class="swal2-input" placeholder="Title">
        <textarea id="swal-description" value="" class="swal2-textarea" placeholder="Description"></textarea>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Save",
    width: "1000px",
    preConfirm: () => {
      const title = (document.getElementById("swal-title") as HTMLInputElement).value;
      const description = (document.getElementById("swal-description") as HTMLTextAreaElement).value;


      if (!title.trim()) {
        Swal.showValidationMessage("Title harus diisi")
        return false;
      }

      return { title, description };
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      popup?.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          Swal.clickConfirm();
        }
      });
    }
    })
    .then(result => {
        if (result.isConfirmed) {
            quadrants.value[quadrant].push({
              id: Date.now().toString(),
              title: result.value.title,
              description: result.value.description
            });
        }

        localStorage.setItem('task-items',JSON.stringify(quadrants.value))
    })
}

const saveToLocalStorage = () => {
  localStorage.setItem('task-items', JSON.stringify(quadrants.value));
}

const onDragEnd = () => {
  saveToLocalStorage();
}

const updateTask = (task: Task, quadrant: keyof typeof quadrants.value) =>{
  Swal.fire({
    title: `TAMBAH DATA ${quadrant.toUpperCase()}`,
    html: `
      <div class="flex flex-col flex-1">
        <input id="swal-title" class="swal2-input" placeholder="Title" value="${task.title}">
        <textarea id="swal-description" class="swal2-textarea" placeholder="Description">${task.description || ''}</textarea>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Save",
    width: "1000px",
    allowEnterKey: true, 
    preConfirm: () => {
      const title = (document.getElementById("swal-title") as HTMLInputElement).value;
      const description = (document.getElementById("swal-description") as HTMLTextAreaElement).value;


      if (!title.trim()) {
        Swal.showValidationMessage("Title harus diisi")
        return false;
      }

      return { title, description };
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      popup?.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          Swal.clickConfirm();
        }
      });
    }
    })
    .then(result => {
      if (result.isConfirmed && result.value) {

          const index = quadrants.value[quadrant].findIndex(t => t.id === task.id);

          if (index !== -1) {
            quadrants.value[quadrant][index] = {
              id: task.id,
              title: result.value.title,
              description: result.value.description,
              type: task.type,
            };
          }

          localStorage.setItem("task-items", JSON.stringify(quadrants.value));

          Swal.fire("Updated!", "Task updated successfully", "success");
        }
    })
}

const deleteTask = (id: string) =>{
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#9AB78F',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    allowEnterKey: true, 
    })
    .then(result => {
        if (result.isConfirmed) {
          Object.keys(quadrants.value).forEach((key) => {
            const qKey = key as keyof typeof quadrants.value;
            quadrants.value[qKey] = quadrants.value[qKey].filter(task => task.id !== id);
          });
          
          Swal.fire({
              title: "Deleted Succesfully",
              icon: "success",
              draggable: true
          });
        }

        localStorage.setItem('task-items',JSON.stringify(quadrants.value))
    })
}

const uploadDB = () => {
  Swal.fire({
    title: `ID Google SpreadSheet`,
    html: `
      <div class="flex flex-col flex-1">
        <input type="file" value="" class="swal2-input border-2 cursor-pointer" id="swal-file" accept=".txt" >
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Save",
    width: "1000px",
    preConfirm: () => {
      const fileInput = document.getElementById("swal-file") as HTMLInputElement;
      const file: File | null = fileInput.files?.[0] || null;

      if (!file) {
        Swal.showValidationMessage("Harus Upload File")
        return false;
      }

      // Read the file inside preConfirm and return a Promise
      return new Promise<{ contents: string }>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const contents = e.target?.result as string;
          resolve({ contents });
        };
        
        reader.onerror = (e) => {
          Swal.showValidationMessage("Error reading file");
          reject(e);
        };
        
        reader.readAsText(file);
      });
    }
  }).then(result => {
    if (result.isConfirmed && result.value?.contents) {
      const jsondata = ref<Task[]>([])
      const parseData = csvToJson(result.value.contents)
      const parsedTasks: Task[] = parseData.map(row => ({
        id: row.id || row.ID || crypto.randomUUID(),
        title: row.title || row.Title || "Untitled",
        description: row.description || row.Description,
        type: row.type || row.Type,
      }))

      jsondata.value.push(...parsedTasks)

      parsedTasks.forEach(item => {
        const task: Task = {
            id: item.id,
            title: item.title,
            description: item.description
          }

          switch (item.type) {
            case "urgentImportant":
              quadrants.value.urgentImportant.push(task)
              break

            case "notUrgentImportant":
              quadrants.value.notUrgentImportant.push(task)
              break

            case "urgentNotImportant":
              quadrants.value.urgentNotImportant.push(task)
              break

            case "notUrgentNotImportant":
              quadrants.value.notUrgentNotImportant.push(task)
              break

            default:
              console.warn("Unknown quadrant type:", item.type)
          }
      })
    
      localStorage.setItem('task-items',JSON.stringify(quadrants.value))
    }
  })
}

const downloadDB = () => {
  const flatData: Task[] = [];

  Object.keys(quadrants.value).forEach(key => {
    const quadrantKey = key as keyof typeof quadrants.value;

    quadrants.value[quadrantKey].forEach(task => {
      flatData.push({
        id: task.id,
        title: task.title,
        description: task.description || "",
        type: quadrantKey
      });
    });
  });

  let csv = "id,title,description,type\n";

  flatData.forEach(task => {
    csv += `${task.id},${task.title},${task.description},${task.type}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `dataset-${new Date().toLocaleString()}.txt`;
  link.click();

  URL.revokeObjectURL(url); // Bersihkan memory
}

const isEmpty = Object.values(quadrants.value).every(arr => arr.length < 1);
if(isEmpty){
  const localData = localStorage.getItem('task-items')
  let data = localData ? JSON.parse(localData) : []

  Object.assign(quadrants.value, data);
}

</script>

<template>

  <!-- Header -->
  <div class="bg-gradient-to-b from-orange-200 to-98%">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-end h-16">
              <nav class="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                  <button class="
                      cursor-pointer hover:text-[var(--blue-color)] px-3 py-2 bg-white/30 rounded-2xl
                      transition-all duration-300 ease-in-out 
                      hover:scale-110 font-mono border-dashed border-b-2 border-t-2 border-white
                  "
                  @click="uploadDB"
                  > Add Dataset .txt</button>
                  <button class="
                      cursor-pointer hover:text-[var(--blue-color)] px-3 py-2 bg-white/30 rounded-2xl
                      transition-all duration-300 ease-in-out 
                      hover:scale-110 font-mono border-dashed border-b-2 border-t-2 border-white
                  "
                  @click="downloadDB"
                  > Download Dataset .txt</button>
              </nav>
          </div>
      </div>
  </div>

  <div class="grid grid-cols-2 px-2 gap-0">

    <div class="border-dashed border-b border-r relative p-4 pt-10">
      <span class="absolute top-2 left-2">Important and Urgent</span>

      <div class="w-full h-[36vh] overflow-y-auto scrollbar-hide">
        <VueDraggable
          v-model="quadrants.urgentImportant"
          group="tasks"
          class="space-y-2"
          @dblclick="addTask('urgentImportant')"
          @end="onDragEnd"
        >
          <div
            v-for="task in quadrants.urgentImportant"
            :key="task.id"
            class="bg-white border rounded-lg p-3 shadow-sm cursor-move hover:shadow-md transition-shadow"
          >

            <div class="flex flex-1 justify-between">
              <div class="">
                <h3 class="font-medium">{{ task.title }}</h3>
                <p class="text-sm text-gray-600" v-if="task.description">
                  {{ task.description }}
                </p>
              </div>

              <div class="flex items-center my-auto">
                <button @click="updateTask(task, 'urgentImportant')" class="bg-blue-500/50 py-auto p-1 rounded-md ml-1 cursor-pointer" title="Edit">
                  <img :src="edit" height="25" width="25">
                </button>
                <button @click="deleteTask(task.id)" class="bg-red-500/50 py-auto p-1 rounded-md ml-1 cursor-pointer" title="Delete">
                  <img :src="trash" height="25" width="25">
                </button>
              </div>
              
            </div>

          </div>
        </VueDraggable>

        <div class="sticky bottom-0 z-10 shadow-md">
          <button 
            @click="addTask('urgentImportant')"
            class="w-full text-sm mt-3 bg-red-100 px-2 py-2 rounded-lg hover:bg-red-200 border-1"
          >
            + Add
          </button>
        </div>
      </div>

    </div>
    
    <div class="border-dashed border-b border-l relative p-4 pt-10">
      <span class="absolute top-2 right-2">Important, but not Urgent</span>

      <div class="w-full h-[36vh] overflow-y-auto scrollbar-hide">
        <VueDraggable
          v-model="quadrants.notUrgentImportant"
          group="tasks"
          class="space-y-2"
          @dblclick="addTask('notUrgentImportant')"
          @end="onDragEnd"
        >
          <div
            v-for="task in quadrants.notUrgentImportant"
            :key="task.id"
            class="bg-white border rounded-lg p-3 shadow-sm cursor-move hover:shadow-md transition-shadow"
          >
              <div class="flex flex-1 justify-between">

                <div class="">
                  <h3 class="font-medium">{{ task.title }}</h3>
                  <p class="text-sm text-gray-600" v-if="task.description">
                    {{ task.description }}
                  </p>
                </div>

                <div class="flex items-center my-auto">
                  <button @click="updateTask(task, 'notUrgentImportant')" class="bg-blue-500/50 py-auto p-1 rounded-md ml-1 cursor-pointer" title="Edit">
                    <img :src="edit" height="25" width="25">
                  </button>
                  <button @click="deleteTask(task.id)" class="bg-red-500/50 py-auto p-1 rounded-md ml-1 cursor-pointer" title="Delete">
                    <img :src="trash" height="25" width="25">
                  </button>
                </div>

              </div>
          </div>
        </VueDraggable>

        <div class="sticky bottom-0 z-10 shadow-md">
          <button 
            @click="addTask('notUrgentImportant')"
            class="w-full text-sm mt-3 bg-red-100 px-2 py-2 rounded-lg hover:bg-red-200 border-1"
          >
            + Add
          </button>
        </div>

      </div>
    </div>


    <div class="border-dashed border-t border-r relative p-4 pt-10">
      <span class="absolute bottom-2 left-2">Urgent, but not Important</span>
      <div class="w-full h-[36vh] overflow-y-auto scrollbar-hide">
        <VueDraggable
          v-model="quadrants.urgentNotImportant"
          group="tasks"
          class="space-y-2"
          @dblclick="addTask('urgentNotImportant')"
          @end="onDragEnd"
        >
          <div
            v-for="task in quadrants.urgentNotImportant"
            :key="task.id"
            class="bg-white border rounded-lg p-3 shadow-sm cursor-move hover:shadow-md transition-shadow"
          >
            <div class="flex flex-1 justify-between">
                <div class="">
                  <h3 class="font-medium">{{ task.title }}</h3>
                  <p class="text-sm text-gray-600" v-if="task.description">
                    {{ task.description }}
                  </p>
                </div>

                <div class="flex items-center my-auto">
                  <button @click="updateTask(task, 'urgentNotImportant')" class="bg-blue-500/50 py-auto p-1 rounded-md ml-1 cursor-pointer" title="Edit">
                    <img :src="edit" height="25" width="25">
                  </button>
                  <button @click="deleteTask(task.id)" class="bg-red-500/50 py-auto p-1 rounded-md ml-1 cursor-pointer" title="Delete">
                    <img :src="trash" height="25" width="25">
                  </button>
                </div>
            </div>
          </div>
        </VueDraggable>

        <div class="sticky bottom-0 z-10 shadow-md">
          <button 
            @click="addTask('urgentNotImportant')"
            class="w-full text-sm mt-3 bg-red-100 px-2 py-2 rounded-lg hover:bg-red-200 border-1"
          >
            + Add
          </button>
        </div>
      </div>
      
    </div>


    <div class="border-dashed border-t border-l relative p-4 pt-10">
      <span class="absolute bottom-2 right-2">Not Urgent and Not Important</span>

      <div class="w-full h-[36vh] overflow-y-auto scrollbar-hide">
        <VueDraggable
          v-model="quadrants.notUrgentNotImportant"
          group="tasks"
          class="space-y-2"
          @dblclick="addTask('notUrgentNotImportant')"
          @end="onDragEnd"
        >
          <div
            v-for="task in quadrants.notUrgentNotImportant"
            :key="task.id"
            class="bg-white border rounded-lg p-3 shadow-sm cursor-move hover:shadow-md transition-shadow"
          >
              <div class="flex flex-1 justify-between">
                
                <div class="">
                  <h3 class="font-medium">{{ task.title }}</h3>
                  <p class="text-sm text-gray-600" v-if="task.description">
                    {{ task.description }}
                  </p>
                </div>

                <div class="flex items-center my-auto">
                  <button @click="updateTask(task, 'notUrgentNotImportant')" class="bg-blue-500/50 py-auto p-1 rounded-md ml-1 cursor-pointer" title="Edit">
                    <img :src="edit" height="25" width="25">
                  </button>
                  <button @click="deleteTask(task.id)" class="bg-red-500/50 py-auto p-1 rounded-md ml-1 cursor-pointer" title="Delete">
                    <img :src="trash" height="25" width="25">
                  </button>
                </div>
              </div>
          </div>
        </VueDraggable>

        <div class="sticky bottom-0 z-10 shadow-md">
          <button 
            @click="addTask('notUrgentNotImportant')"
            class="w-full text-sm mt-3 bg-red-100 px-2 py-2 rounded-lg hover:bg-red-200 border-1"
          >
            + Add
          </button>
        </div>
      </div>

    </div>
  </div>
</template>