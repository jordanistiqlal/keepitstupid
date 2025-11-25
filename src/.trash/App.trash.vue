<script setup lang="ts">
import { ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
// import Header from './components/Header.vue';
import Swal from 'sweetalert2';
import csvToJson from '../Utils/csvtojson';

interface Task{
 id?: string;
 title?: string;
 description?: string;
}
interface Task_Sheet{
 id?: string;
 title?: string;
 description?: string;
 type?: string;
}

const quadrants = ref({
  urgentImportant: [] as Task[],
  notUrgentImportant: [] as Task[],
  urgentNotImportant: [] as Task[],
  notUrgentNotImportant: [] as Task[],
})

// https://docs.google.com/spreadsheets/d/e/2PACX-1vQRCBd3qkZZZOzSs5X_m6J5i9AyG2AakAb-skXPK6Qn3Of0AWbi5iTasPtX8SyvSRQ7otCgGeeCiLaN/pub?gid=1065733280&single=true&output=csv

// https://script.google.com/macros/s/AKfycbxhhr98azun8KPqDOUHIpo6s9X99xu4tzAkhqXluIbhZ0fR7EdIdVDmUOyG7hgLHEaj/exec

const getData = async (id: string) => {
  // const sheetId: string = '2PACX-1vQRCBd3qkZZZOzSs5X_m6J5i9AyG2AakAb-skXPK6Qn3Of0AWbi5iTasPtX8SyvSRQ7otCgGeeCiLaN'
  const sheetId: string = id
  const sheetUrl: string = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?gid=1065733280&single=true&output=csv`
  localStorage.setItem('id-spreadsheet', id)

  const jsondata = ref<Task_Sheet[]>([])
  const response = await fetch(sheetUrl); 
  const result = await response.text();
  const parseData = csvToJson(result)
  const parsedTasks: Task_Sheet[] = parseData.map(row => ({
    id: row.id || row.ID,
    title: row.title || row.Title,
    description: row.description || row.Description,
    type: row.type || row.Type,
  }))

  jsondata.value.push(...parsedTasks)

  // Categorize tasks
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
}

const pushToSheet = async (task: Task & { type: string }) => {
  const url:string = "https://script.google.com/macros/s/AKfycbz9Zkdk0ySDjl97i6YyjPrkUOhOvw0_Bp7N5MfgJQ_zxKrYeba0_V7r18B_RKkl_8bf/exec";

  const spreadsheetId = '1zjOx2mUn2DvE9WFYlot4rpUqDHQCKL571IipRkJmOqQ';

    await fetch(url, {
    method: "POST",
    mode: "no-cors", // Comment this out temporarily
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({...task, spreadsheetId: spreadsheetId})
  }).then(res => res.json()).then(console.log).catch(console.error);
};


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
    }
    }).then(result => {
      if (result.isConfirmed) {
          // quadrants.value[quadrant].push({
          //   id: Date.now().toString(),
          //   title: result.value.title,
          //   description: result.value.description
          // });

            const newTask = {
              id: Date.now().toString(),
              title: result.value.title,
              description: result.value.description
            };

            quadrants.value[quadrant].push(newTask);

            // push ke google sheet
            pushToSheet({
              ...newTask,
              type: quadrant
            });
      }
  })
}

const addDB = () =>{
  Swal.fire({
    title: `ID Google SpreadSheet`,
    html: `
      <div class="flex flex-col flex-1">
        <input id="swal-id" value="" class="swal2-input" placeholder="XXXXX-XXXXX-.....">
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Save",
    width: "1000px",
    preConfirm: () => {
      const id = (document.getElementById("swal-id") as HTMLInputElement).value;


      if (!id.trim()) {
        Swal.showValidationMessage("ID harus diisi")
        return false;
      }

      return { id };
    }
  }).then(result => {
      getData(result.value.id)
  })
}

if(localStorage.getItem('id-spreadsheet')){
  const storedId  = localStorage.getItem('id-spreadsheet')
  if (storedId) {
    getData(storedId)

    // localStorage.removeItem('id-spreadsheet')
  } 
}

</script>

<template>
  <!-- <Header /> -->

    <!-- Header -->
    <div class="bg-gradient-to-b from-orange-200 to-98%">
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-end h-16">
                <nav class="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                    <button class="
                        cursor-pointer
                        hover:text-[var(--white-color)]
                        px-3 py-2 
                        transition-all duration-300 ease-in-out 
                        hover:scale-110
                        font-mono
                        border-dashed
                        border-b-2
                        border-t-2
                        border-white
                    "
                    @click="addDB"
                    > Add Spreaddsheet Google DB</button>
                </nav>
            </div>
        </div>
    </div>

  <div class="grid grid-cols-2 px-2 gap-0">

    <div class="border-dashed border-b border-r h-[43vh] relative p-4 pt-10">
      <span class="absolute top-2 left-2">Important and Urgent</span>

      <div class="w-full h-[36vh] overflow-y-auto scrollbar-hide">
        <VueDraggable
          v-model="quadrants.urgentImportant"
          group="tasks"
          class="space-y-2"
          @dblclick="addTask('urgentImportant')"
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


    <div class="border-dashed border-t border-r h-[43vh] relative p-4 pt-10">
      <span class="absolute bottom-2 left-2">Urgent, but not Important</span>
      <div class="w-full h-[36vh] overflow-y-auto scrollbar-hide">
        <VueDraggable
          v-model="quadrants.urgentNotImportant"
          group="tasks"
          class="space-y-2"
          @dblclick="addTask('urgentNotImportant')"
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