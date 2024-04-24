<script setup lang="ts">
import router from "@/router";
import { ProjectStore } from "@/stores/project";
import { AuthStore } from "@/stores/auth";
import { ContentStore } from "@/stores/content";

const { doLogout } = $(AuthStore());
const {
  getProjects,
  projects,
  newProjectName,
  selectProject,
  selectedProject,
  getTemplates,
  templates,
  selectedTemplate,
  createNewProjectFromTemplate,
  createProjectJob,
} = $(ProjectStore());

const { selectedContent } = $(ContentStore());

enum ModalOptionsEnum {
  PROJECT_MODAL,
  JOB_MODAL,
}

let modalOption = $ref<ModalOptionsEnum>(0);
let isModalOpen = $ref<boolean>(false);

const init = async () => {
  try {
    await getProjects();
    await getTemplates();
  } catch (error) {
    webflow.notify({
      type: "Error",
      message: "Something went wrong, please try again later.",
    });
  }
};

const openModal = (option: ModalOptionsEnum) => {
  modalOption = option;
  isModalOpen = true;
};

const handleProjectCreation = async () => {
  if (!selectedTemplate) return;
  try {
    await createNewProjectFromTemplate(selectedTemplate.uid, {
      name: newProjectName,
    });
    await getProjects();

    isModalOpen = false;
  } catch (error) {
    webflow.notify({
      type: "Error",
      message: "Something went wrong, please try again later.",
    });
  }
};

const normalizedContentData = $computed(() => ({
  nodes: selectedContent.map((item) => {
    return {
      nodeId: item.value,
      text: item.label,
    };
  }),
}));

const createNewJob = async () => {
  if (!selectedProject) return;
  try {
    await createProjectJob(
      selectedProject.uid,
      selectedProject.targetLangs,
      normalizedContentData,
    );
    router.push("/job");
  } catch (error) {
    webflow.notify({
      type: "Error",
      message: "Something went wrong, please try again later.",
    });
  }
};

const isProjectCreationDisabled = $computed<boolean>(
  () => !newProjectName || !selectedTemplate,
);
const jobSubmitDisabled = $computed<boolean>(() => !selectedProject);

init();
</script>

<template>
  <div class="p-3 flex flex-col w-full h-screen">
    <div class="flex justify-between items-center">
      <div class="flex flex-col gap-1 mb-4">
        <h1 class="text-white text-md">Project Selection</h1>
        <h2 class="text-white text-small">Select or Create a project</h2>
      </div>
      <div>
        <BaseButton @click="doLogout()" class="flex justify-center">
          <BaseIcon name="logout"></BaseIcon>
        </BaseButton>
      </div>
    </div>
    <div
      class="flex-1 mx-auto border border-border-3 rounded p-4 w-full overflow-y-auto"
    >
      <div class="flex">
        <BaseButton
          state="primary"
          @click="openModal(ModalOptionsEnum.PROJECT_MODAL)"
        >
          Create project from template
        </BaseButton>
      </div>
      <div
        class="project-table mt-3 text-white divide-y divide-border-1 text-small"
      >
        <div
          class="grid grid-cols-6 gap-2 header text-blue-main uppercase py-2"
        >
          <span class="pl-2">Name</span>
          <span>Source langs</span>
          <span class="col-span-2">Target langs</span>
          <span>Status</span>
          <span class="text-center">Created at</span>
        </div>
        <div
          v-for="project in projects"
          :key="project.id"
          :class="[
            {
              'bg-blue-main': selectedProject?.uid === project.uid,
            },
            'grid grid-cols-6 gap-2 py-2 cursor-pointer hover:bg-hover',
          ]"
          @click="selectProject(project)"
        >
          <div class="pl-2">{{ project.name }}</div>
          <div>{{ project.sourceLang }}</div>
          <div class="col-span-2">{{ project.targetLangs }}</div>
          <div>{{ project.status }}</div>
          <div class="text-center">
            {{ new Date(project.dateCreated).toLocaleDateString() }}
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-between items-center">
      <a
        class="text-small text-white underline"
        href="https://phrase.com/privacy/"
        target="_blank"
        >Privacy Policy</a
      >
      <div class="flex justify-end gap-2 mt-4">
        <BaseButton @click="router.push('/')">Back</BaseButton>
        <BaseButton
          state="primary"
          @click="createNewJob"
          :disabled="jobSubmitDisabled"
        >
          Submit
        </BaseButton>
        <BaseButton @click="router.push('/job')">Job Status</BaseButton>
      </div>
    </div>

    <BaseModal :is-open="isModalOpen" @modal-close="isModalOpen = false">
      <template #header>
        <h2
          v-if="modalOption === ModalOptionsEnum.PROJECT_MODAL"
          class="text-medium text-white"
        >
          Create new project from a template
        </h2>
        <h2 v-else class="text-medium text-white">
          Select job target languages
        </h2>
      </template>
      <template #content>
        <TemplateProjectContent
          v-model:new-project-name="newProjectName"
          v-model:selected-template="selectedTemplate"
          :templates="templates"
        ></TemplateProjectContent>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton @click="isModalOpen = false">Cancel</BaseButton>
          <BaseButton
            state="primary"
            @click="handleProjectCreation"
            :disabled="isProjectCreationDisabled"
          >
            Create project
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
