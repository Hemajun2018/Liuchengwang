<template>
  <div class="node-list-container">
    <div class="page-header">
      <h2 class="page-title">节点管理 {{ projectName }}</h2>
      <div class="header-actions">
        <el-button-group>
          <el-button type="warning" @click="openPrerequisiteDialog()">
            <el-icon><Plus /></el-icon>添加前置条件
          </el-button>
          <el-button type="primary" @click="openNodeDialog()">
            <el-icon><Plus /></el-icon>添加节点
          </el-button>
          <el-button type="success" @click="openResultDialog">
            <el-icon><Plus /></el-icon>添加成果
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 前置条件卡片 -->
    <el-card v-if="prerequisites.length > 0" class="node-card prerequisite-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">前置条件</span>
          <el-button type="primary" size="small" @click="openPrerequisiteDialog()">管理前置条件</el-button>
        </div>
      </template>
      <div class="card-content">
        <el-table :data="prerequisites" style="width: 100%">
          <el-table-column prop="content" label="需交付内容" min-width="200" />
          <el-table-column prop="startDate" label="开始时间" width="120">
            <template #default="scope">
              {{ formatDate(scope.row.startDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="endDate" label="预计完成时间" width="120">
            <template #default="scope">
              {{ formatDate(scope.row.endDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="durationDays" label="预计天数" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getPrerequisiteStatusType(scope.row.status)">
                {{ getPrerequisiteStatusText(scope.row.status) }}
            </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" link @click="openPrerequisiteDialog(scope.row)">编辑</el-button>
              <el-button type="danger" link @click="handleDeletePrerequisite(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 节点列表 -->
    <div class="nodes-list">
      <el-card v-for="node in nodes" :key="node.id" class="node-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">{{ node.name }}</span>
            <div class="card-actions">
              <el-button-group>
                <el-button type="primary" size="small" @click="openIssueDialog(node.id)">添加问题</el-button>
                <el-button type="success" size="small" @click="openMaterialDialog(node.id)">添加材料</el-button>
                <el-button type="warning" size="small" @click="openDeliverableDialog(node.id)">添加交付内容</el-button>
                <el-button type="warning" size="small" @click="openNodeDialog(node)">编辑</el-button>
                <el-button type="danger" size="small" @click="handleDeleteNode(node.id)">删除</el-button>
              </el-button-group>
            </div>
          </div>
        </template>
        <div class="card-content">
          <!-- 交付内容表格 -->
          <div v-if="node.deliverables && node.deliverables.length > 0" class="sub-section">
            <div class="sub-section-header">
              <h4>交付内容列表</h4>
              <el-button link @click="toggleDeliverables(node.id)">
                {{ isDeliverablesFolded(node.id) ? '展开' : '折叠' }}
              </el-button>
            </div>
            <div v-show="!isDeliverablesFolded(node.id)">
              <el-table :data="node.deliverables" style="width: 100%" border>
                <el-table-column label="描述" prop="description" min-width="200" />
                <el-table-column label="开始时间" width="120">
                  <template #default="scope">
                    {{ formatDate(scope.row.start_date) }}
                  </template>
                </el-table-column>
                <el-table-column label="结束时间" width="120">
                  <template #default="scope">
                    {{ formatDate(scope.row.expected_end_date) }}
                  </template>
                </el-table-column>
                <el-table-column label="持续天数" width="100" prop="duration_days" />
                <el-table-column label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="getDeliverableStatusType(scope.row.status)">
                      {{ getDeliverableStatusLabel(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button type="primary" link @click="handleEditDeliverable(node.id, scope.row)">编辑</el-button>
                    <el-button type="danger" link @click="handleDeleteDeliverable(node.id, scope.row.id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 问题列表 -->
          <div v-if="getNodeIssues(node.id).length > 0" class="sub-section">
            <div class="sub-section-header">
              <h4>问题列表</h4>
              <el-button link @click="toggleIssues(node.id)">
                {{ isIssuesFolded(node.id) ? '展开' : '折叠' }}
              </el-button>
            </div>
            <div v-show="!isIssuesFolded(node.id)">
              <issue-list
                :issues="getNodeIssues(node.id)"
                :nodeId="node.id"
                @detail="(issue) => handleIssueDetail(node.id, issue)"
                @edit="(issue) => handleEditIssue(node.id, issue)"
                @delete="handleDeleteIssue"
              />
            </div>
          </div>

          <!-- 材料列表 -->
          <div v-if="getNodeMaterials(node.id).length > 0" class="sub-section">
            <div class="sub-section-header">
              <h4>材料列表</h4>
              <el-button link @click="toggleMaterials(node.id)">
                {{ isMaterialsFolded(node.id) ? '展开' : '折叠' }}
              </el-button>
            </div>
            <div v-show="!isMaterialsFolded(node.id)">
              <el-table :data="getNodeMaterials(node.id)" style="width: 100%" border>
                <el-table-column label="材料名称" prop="name" min-width="150" />
                <el-table-column label="描述" prop="description" min-width="200" />
                <el-table-column label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="getStatusTagType(getStatusNumber(scope.row.status))">
                      {{ getStatusText(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button type="primary" link @click="handleMaterialDetail(node.id, scope.row)">详情</el-button>
                    <el-button type="primary" link @click="handleEditMaterial(node.id, scope.row)">编辑</el-button>
                    <el-button type="danger" link @click="handleDeleteMaterial(node.id, scope.row.id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 成果卡片 -->
    <el-card class="node-card result-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">项目成果</span>
          <el-button type="primary" size="small" @click="openResultDialog">编辑</el-button>
        </div>
      </template>
      <div class="card-content">
        <div v-if="projectResult.results && projectResult.results.length > 0" class="result-items-display">
          <div v-for="(result, index) in projectResult.results" :key="result.id || index" class="result-item-display">
            <div class="result-item-header">
              <span class="result-index">成果 {{ index + 1 }}</span>
            </div>
            <p class="result-description">{{ result.description }}</p>
          </div>
        </div>
        <el-empty v-else description="暂无成果" />
      </div>
    </el-card>

    <!-- 前置条件对话框 -->
    <el-dialog
      v-model="prerequisiteDialogVisible"
      :title="isEditPrerequisiteMode ? '编辑前置条件' : '添加前置条件'"
      width="500px"
    >
      <el-form
        ref="prerequisiteFormRef"
        :model="prerequisiteForm"
        :rules="prerequisiteRules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="需交付内容" prop="content">
          <el-input
            v-model="prerequisiteForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入需交付内容"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker
            v-model="prerequisiteForm.startDate"
            type="date"
            placeholder="请选择开始时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handlePrerequisiteDateChange"
          />
        </el-form-item>
        <el-form-item label="预计完成时间" prop="endDate">
          <el-date-picker
            v-model="prerequisiteForm.endDate"
            type="date"
            placeholder="请选择预计完成时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handlePrerequisiteDateChange"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="prerequisiteForm.status" placeholder="请选择">
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已延期" value="delayed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="prerequisiteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePrerequisiteSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 节点对话框 -->
    <el-dialog
      v-model="nodeDialogVisible"
      :title="isEditMode ? '编辑节点' : '添加节点'"
      width="600px"
    >
      <el-form
        ref="nodeFormRef"
        :model="nodeForm"
        :rules="nodeRules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="节点名称" prop="name">
          <el-input v-model="nodeForm.name" placeholder="请输入节点名称" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="nodeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleNodeSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 问题对话框 -->
    <el-dialog
      v-model="issueDialogVisible"
      v-if="issueDialogVisible"
      :title="isEditIssueMode ? '编辑问题' : '添加问题'"
      width="500px"
      @closed="handleDialogClosed"
    >
      <issue-form
        :initial-data="currentIssue || undefined"
        @submit="handleIssueSubmit"
        @cancel="handleIssueCancel"
      />
    </el-dialog>

    <!-- 问题详情对话框 -->
    <el-dialog
      v-model="issueDetailDialogVisible"
      title="问题详情"
      width="600px"
    >
      <div v-if="currentIssueDetail" class="issue-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="问题描述">
            {{ currentIssueDetail.content }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentIssueDetail.status === 'pending' ? 'danger' : 'success'">
              {{ currentIssueDetail.status === 'pending' ? '待处理' : '已解决' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">
            {{ formatDate(currentIssueDetail.startDate ?? null) }}
          </el-descriptions-item>
          <el-descriptions-item label="预计结束日期">
            {{ formatDate(currentIssueDetail.endDate ?? null) }}
          </el-descriptions-item>
          <el-descriptions-item label="持续天数">
            {{ currentIssueDetail.durationDays || '未计算' }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="dialog-footer">
          <el-button @click="issueDetailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleEditIssueFromDetail">编辑</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 材料对话框 -->
    <el-dialog
      v-model="materialDialogVisible"
      :title="isEditMaterialMode ? '编辑材料' : '添加材料'"
      width="500px"
    >
      <el-form
        ref="materialFormRef"
        :model="materialForm"
        :rules="materialRules"
        label-width="80px"
        status-icon
      >
        <!-- 材料名称 -->
        <el-form-item label="材料名称" prop="name">
          <el-input v-model="materialForm.name" />
        </el-form-item>

        <!-- 材料描述 -->
        <el-form-item label="材料描述" prop="description">
          <el-input
            v-model="materialForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入材料描述"
          />
        </el-form-item>

        <!-- 开始日期 -->
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="materialForm.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleMaterialStartDateChange"
          />
        </el-form-item>

        <!-- 结束日期 -->
        <el-form-item label="预计结束日期" prop="endDate">
          <el-date-picker
            v-model="materialForm.endDate"
            type="date"
            placeholder="选择预计结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disableMaterialEndDateBefore"
            @change="handleMaterialEndDateChange"
          />
        </el-form-item>

        <!-- 完成天数 -->
        <el-form-item label="完成天数" prop="durationDays">
          <el-input-number
            v-model="materialForm.durationDays"
            :min="1"
            :disabled="!materialForm.startDate"
            controls-position="right"
            @change="handleMaterialDurationChange"
          />
        </el-form-item>

        <!-- 状态 -->
        <el-form-item label="状态" prop="status">
          <el-select v-model="materialForm.status" placeholder="请选择状态">
            <el-option label="未开始" :value="NodeStatus.NOT_STARTED" />
            <el-option label="进行中" :value="NodeStatus.IN_PROGRESS" />
            <el-option label="已完成" :value="NodeStatus.COMPLETED" />
            <el-option label="已阻塞" :value="NodeStatus.BLOCKED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="materialDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveMaterial" :loading="saveLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 成果对话框 -->
    <el-dialog
      v-model="resultDialogVisible"
      title="添加成果"
      width="500px"
    >
      <el-form
        ref="resultFormRef"
        :model="resultForm"
        :rules="resultRules"
        label-width="80px"
        status-icon
      >
        <!-- 成果列表 -->
        <div class="result-list">
          <div class="result-header">
            <span class="result-title">成果列表</span>
            <el-button 
              type="primary" 
              size="small"
              @click="addResult"
            >
              添加成果
            </el-button>
          </div>
          
          <div v-if="resultForm.results.length > 0" class="result-items">
            <div 
              v-for="(result, index) in resultForm.results" 
              :key="result.id"
              class="result-item"
            >
              <div class="result-item-header">
                <span class="result-index">成果{{ index + 1 }}</span>
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="removeResult(index)"
                >
                  删除
                </el-button>
              </div>
              <el-input
                v-model="result.description"
                type="textarea"
                :rows="3"
                :placeholder="'请输入成果' + (index + 1) + '的描述'"
              />
            </div>
          </div>
          <el-empty v-else description="暂无成果" />
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resultDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleResultSubmit" :loading="saveLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 节点详情对话框 -->
    <el-dialog
      v-model="nodeDetailDialogVisible"
      title="节点详情"
      width="600px"
    >
      <div v-if="currentNodeDetail" class="node-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="节点名称">
            {{ currentNodeDetail.name }}
          </el-descriptions-item>
          <el-descriptions-item label="顺序">
            {{ currentNodeDetail.order }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(currentNodeDetail.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDate(currentNodeDetail.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="dialog-footer">
          <el-button @click="nodeDetailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="openNodeDialog(currentNodeDetail)">编辑</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 材料详情对话框 -->
    <el-dialog
      v-model="materialDetailDialogVisible"
      title="材料详情"
      width="600px"
    >
      <div v-if="currentMaterialDetail" class="material-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="材料名称">
            {{ currentMaterialDetail.name }}
          </el-descriptions-item>
          <el-descriptions-item label="材料描述">
            {{ currentMaterialDetail.description }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(getStatusNumber(currentMaterialDetail.status))">
              {{ getStatusText(currentMaterialDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">
            {{ formatDate(currentMaterialDetail.startDate ?? null) }}
          </el-descriptions-item>
          <el-descriptions-item label="结束日期">
            {{ formatDate(currentMaterialDetail.endDate ?? null) }}
          </el-descriptions-item>
          <el-descriptions-item label="持续天数">
            {{ currentMaterialDetail.durationDays || '未计算' }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="dialog-footer">
          <el-button @click="materialDetailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="currentNodeId && currentMaterialDetail ? handleEditMaterial(currentNodeId, currentMaterialDetail) : undefined">编辑</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 交付内容对话框 -->
    <el-dialog
      v-model="deliverableDialogVisible"
      :title="isEditDeliverableMode ? '编辑交付内容' : '添加交付内容'"
      width="500px"
    >
      <el-form
        ref="deliverableFormRef"
        :model="deliverableForm"
        :rules="deliverableRules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="deliverableForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入交付内容描述"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker
            v-model="deliverableForm.startDate"
            type="date"
            placeholder="请选择开始时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDeliverableDateChange"
          />
        </el-form-item>
        <el-form-item label="预计完成时间" prop="endDate">
          <el-date-picker
            v-model="deliverableForm.endDate"
            type="date"
            placeholder="请选择预计完成时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDeliverableDateChange"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="deliverableForm.status" placeholder="请选择">
            <el-option label="未开始" value="not_started" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已延期" value="delayed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deliverableDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDeliverableSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { 
  getNodeList, 
  createNode, 
  updateNode, 
  deleteNode, 
  createIssue, 
  updateIssue, 
  deleteIssue,
  createNodeMaterial,
  updateNodeMaterial,
  deleteNodeMaterial,
  NodeStatus, 
  IssueStatus, 
  type Node,
  type Issue,
  type Material
} from '../../api/node';
import { getProject, updateProjectResult } from '../../api/project';
import { getPrerequisites, createPrerequisite, updatePrerequisite, deletePrerequisite } from '../../api/prerequisite';
import IssueForm from '@/components/issues/IssueForm.vue';
import {
  getDeliverables,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
  DeliverableStatus,
  type Deliverable
} from '../../api/deliverable';
import { differenceInDays } from 'date-fns';
import IssueList from '@/components/issues/IssueList.vue';

const route = useRoute();
const projectId = computed(() => route.params.id as string);
const projectName = ref('');
const loading = ref(false);
const saveLoading = ref(false);

// 节点列表
const nodes = ref<Node[]>([]);
const prerequisites = ref<any[]>([]);

// 节点对话框
const nodeDialogVisible = ref(false);
const nodeFormRef = ref<FormInstance>();
const isEditMode = ref(false);

// 节点详情
const nodeDetailDialogVisible = ref(false);
const currentNodeDetail = ref<Node | null>(null);

// 前置条件相关变量
const prerequisiteDialogVisible = ref(false);
const isEditPrerequisiteMode = ref(false);
const currentPrerequisiteId = ref<number | null>(null);
const prerequisiteFormRef = ref<FormInstance>();
const prerequisiteForm = ref({
  content: '',
  startDate: null as string | null,
  endDate: null as string | null,
  status: 'pending'
});

// 前置条件验证规则
const prerequisiteRules = reactive<FormRules>({
  content: [
    { required: true, message: '请输入需交付内容', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
});

// 问题相关变量
const foldedIssues = ref(new Set<number>());
const issueDialogVisible = ref(false);
const isEditIssueMode = ref(false);
const currentNodeId = ref<number | null>(null);
const currentIssue = ref<Issue | null>(null);
const currentIssueDetail = ref<Issue | null>(null);
const currentIssueId = ref<number | null>(null);
const issueDetailDialogVisible = ref(false);
const issueForm = ref({
  content: '',
  status: IssueStatus.PENDING,
  startDate: null as string | null,
  expectedEndDate: null as string | null,
  durationDays: null as number | null
});

// 材料相关变量
const foldedMaterials = ref(new Set<number>());
const materialDialogVisible = ref(false);
const isEditMaterialMode = ref(false);
const currentMaterialId = ref<number | null>(null);
const currentMaterialDetail = ref<Material | null>(null);
const materialDetailDialogVisible = ref(false);
const materialFormRef = ref<FormInstance>();
const materialForm = ref({
  nodeId: 0,
  name: '',
  description: '',
  startDate: null as Date | string | null,
  endDate: null as Date | string | null,
  durationDays: 0,
  status: NodeStatus.NOT_STARTED
});

// 材料表单验证规则
const materialRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入材料名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入材料描述', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
});

// 成果相关变量
const resultDialogVisible = ref(false);
const resultFormRef = ref<FormInstance>();
const resultForm = ref({
  results: [] as Array<{ id?: number; description: string }>
});
const projectResult = ref({
  results: [] as Array<{ id?: number; description: string }>
});

// 成果表单验证规则
const resultRules = reactive<FormRules>({
  'results.description': [
    { required: true, message: '请输入成果描述', trigger: 'blur' }
  ]
});

// 交付内容折叠控制
const foldedDeliverables = ref(new Set<number>());

// 交付内容相关变量
const deliverableDialogVisible = ref(false);
const isEditDeliverableMode = ref(false);
const currentDeliverableId = ref<number | null>(null);
const deliverableFormRef = ref<FormInstance>();
const deliverableForm = ref({
  description: '',
  startDate: null as string | null,
  endDate: null as string | null,
  durationDays: 0,
  status: 'not_started' as DeliverableStatus
});

// 交付内容验证规则
const deliverableRules = reactive<FormRules>({
  description: [
    { required: true, message: '请输入交付内容描述', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择预计完成时间', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
});

// 节点表单
const nodeForm = ref({
  id: undefined as number | undefined,
  name: '',
  order: 0,
  progresses: [] as any[],
  deliverables: [] as any[],
  isPrerequisite: false,
  isResult: false
});

// 节点表单验证规则
const nodeRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入节点名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  order: [
    { required: true, message: '请输入顺序', trigger: 'change' }
  ]
});

// 在节点卡片的交付内容部分添加以下代码
const nodeDeliverablesMap = ref<Record<number, any[]>>({});

// 加载节点的交付内容
const loadNodeDeliverables = async (nodeId: number) => {
  try {
    console.log(`手动加载节点 ${nodeId} 的交付内容`);
    const deliverables = await getDeliverables(projectId.value, nodeId);
    console.log(`获取到节点 ${nodeId} 的交付内容:`, deliverables);
    nodeDeliverablesMap.value[nodeId] = deliverables;
  } catch (error) {
    console.error(`加载节点 ${nodeId} 的交付内容失败:`, error);
    ElMessage.error('加载交付内容失败');
  }
};

// 获取交付内容状态类型
const getDeliverableStatusType = (status: DeliverableStatus) => {
  switch (status) {
    case DeliverableStatus.NOT_STARTED:
      return 'info';
    case DeliverableStatus.IN_PROGRESS:
      return 'warning';
    case DeliverableStatus.COMPLETED:
      return 'success';
    case DeliverableStatus.DELAYED:
      return 'danger';
    default:
      return 'info';
  }
};

// 获取交付内容状态标签
const getDeliverableStatusLabel = (status: DeliverableStatus) => {
  switch (status) {
    case DeliverableStatus.NOT_STARTED:
      return '未开始';
    case DeliverableStatus.IN_PROGRESS:
      return '进行中';
    case DeliverableStatus.COMPLETED:
      return '已完成';
    case DeliverableStatus.DELAYED:
      return '已延期';
    default:
      return '未知状态';
  }
};

// 获取项目信息
const fetchProjectInfo = async () => {
  try {
    loading.value = true;
    console.log('开始获取项目信息, projectId:', projectId.value);
    
    const project = await getProject(projectId.value);
    console.log('获取到项目信息:', project);
    
    projectName.value = project.name;
    
    // 加载项目成果
    if (project.results && Array.isArray(project.results)) {
      projectResult.value.results = project.results;
    } else {
      projectResult.value.results = [];
    }
    console.log('已加载成果数据:', projectResult.value);
    
    // 更新路由标题
    document.title = `节点管理 - ${project.name} - 流程王`;
  } catch (error) {
    console.error('获取项目信息失败:', error);
    ElMessage.error('获取项目信息失败');
  } finally {
    loading.value = false;
  }
};

// 获取前置条件列表
const fetchPrerequisites = async () => {
  try {
    loading.value = true;
    prerequisites.value = await getPrerequisites(projectId.value);
    console.log('获取到前置条件列表:', prerequisites.value);
  } catch (error) {
    console.error('获取前置条件列表失败:', error);
    ElMessage.error('获取前置条件列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取节点列表
const fetchNodes = async () => {
  try {
    loading.value = true;
    console.log('开始获取节点列表, 项目ID:', projectId.value);
    
    nodes.value = await getNodeList(projectId.value);
    
    // 添加详细调试信息
    console.log('获取到节点列表:', nodes.value);
    console.log('节点数量:', nodes.value.length);
    
    // 为每个节点手动加载交付内容
    for (const node of nodes.value) {
      try {
        console.log(`手动加载节点 ${node.id} 的交付内容`);
        const deliverables = await getDeliverables(projectId.value, node.id);
        console.log(`获取到节点 ${node.id} 的交付内容:`, deliverables);
        
        // 直接设置节点的交付内容
        node.deliverables = deliverables;
        
        // 同时更新缓存
        nodeDeliverablesMap.value[node.id] = deliverables;
      } catch (error) {
        console.error(`加载节点 ${node.id} 的交付内容失败:`, error);
      }
    }
    
  } catch (error) {
    console.error('获取节点列表失败:', error);
    ElMessage.error('获取节点列表失败');
  } finally {
    loading.value = false;
  }
};

// 添加交付内容
const addDeliverable = () => {
  nodeForm.value.deliverables.push({
    description: '',
    startDate: null,
    endDate: null,
    durationDays: 0,
    status: DeliverableStatus.NOT_STARTED
  });
};

// 删除交付内容
const removeDeliverable = (index: number) => {
  nodeForm.value.deliverables.splice(index, 1);
};

// 计算天数
const calculateDuration = (index: number) => {
  const deliverable = nodeForm.value.deliverables[index];
  if (deliverable.startDate && deliverable.endDate) {
    const startDate = new Date(deliverable.startDate);
    const endDate = new Date(deliverable.endDate);
    deliverable.durationDays = differenceInDays(endDate, startDate);
  }
};

// 修改节点提交处理
const handleNodeSubmit = async () => {
  if (!nodeFormRef.value) return;
  
  await nodeFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        saveLoading.value = true;
        
        // 创建或更新节点
        let nodeResponse;
        if (isEditMode.value && nodeForm.value.id) {
          // 更新节点
          nodeResponse = await updateNode(projectId.value, nodeForm.value.id, {
            name: nodeForm.value.name,
            order: nodeForm.value.order
          });
        } else {
          // 创建节点
          nodeResponse = await createNode(projectId.value, {
            name: nodeForm.value.name,
            order: nodeForm.value.order
          });
        }
        
        // 处理交付内容
        if (nodeResponse) {
          const nodeId = nodeResponse.id;
          
          // 获取现有交付内容
          const existingDeliverables = await getDeliverables(projectId.value, nodeId);
          
          // 处理每个交付内容
          for (const deliverable of nodeForm.value.deliverables) {
            if (deliverable.id) {
              // 更新现有交付内容
              await updateDeliverable(projectId.value, nodeId, deliverable.id, {
                description: deliverable.description,
                startDate: deliverable.startDate,
                endDate: deliverable.endDate,
                durationDays: deliverable.durationDays,
                status: deliverable.status
              });
            } else {
              // 创建新交付内容
              await createDeliverable(projectId.value, nodeId, {
                nodeId: nodeId,
                description: deliverable.description,
                startDate: deliverable.startDate || null,
                endDate: deliverable.endDate || null,
                durationDays: deliverable.durationDays || 0,
                status: deliverable.status
              });
            }
          }
          
          // 删除不再存在的交付内容
          for (const existingDeliverable of existingDeliverables) {
            const stillExists = nodeForm.value.deliverables.some(
              d => d.id === existingDeliverable.id
            );
            
            if (!stillExists && existingDeliverable.id) {
              await deleteDeliverable(projectId.value, nodeId, existingDeliverable.id);
            }
          }
        }
        
        ElMessage.success(isEditMode.value ? '节点更新成功' : '节点创建成功');
        nodeDialogVisible.value = false;
        fetchNodes();
      } catch (error) {
        console.error('保存节点失败:', error);
        ElMessage.error('操作失败，请重试');
      } finally {
        saveLoading.value = false;
      }
    }
  });
};

// 问题和材料相关
const getNodeIssues = (nodeId: number) => {
  const node = nodes.value.find(n => n.id === nodeId);
  if (!node) return [];
  if (!node.issues) {
    node.issues = [];
  }
  return node.issues.map(issue => ({
    ...issue,
    description: issue.content,
    content: issue.content
  }));
};

const getNodeMaterials = (nodeId: number) => {
  const node = nodes.value.find(n => n.id === nodeId);
  return node?.materials || [];
};

const handleEditIssue = (nodeId: number, issue: Issue) => {
  console.log('开始编辑问题 - 节点ID:', nodeId, '问题:', issue);
  currentNodeId.value = nodeId;
  currentIssue.value = issue;
  isEditIssueMode.value = true;
  issueDialogVisible.value = true;
};

const handleIssueDetail = (nodeId: number, issue: Issue) => {
  console.log('查看问题详情:', issue);
  // 确保使用API中定义的Issue类型的字段
  currentIssueDetail.value = {
    ...issue,
    id: issue.id,
    node_id: issue.node_id || nodeId,
    content: issue.content,
    status: issue.status,
    start_date: issue.start_date,
    expected_end_date: issue.expected_end_date,
    duration_days: issue.duration_days,
    created_at: issue.created_at || new Date(),
    updated_at: issue.updated_at || new Date(),
    // 兼容前端的别名
    startDate: issue.start_date || issue.startDate,
    endDate: issue.expected_end_date || issue.endDate,
    durationDays: issue.duration_days || issue.durationDays || 0
  };
  currentNodeId.value = nodeId;
  currentIssueId.value = issue.id;
  issueDetailDialogVisible.value = true;
};

const handleEditMaterial = (nodeId: number, material: Material) => {
  materialForm.value = {
    nodeId,
    name: material.name,
    description: material.description,
    startDate: material.start_date || material.startDate,
    endDate: material.expected_end_date || material.endDate,
    durationDays: material.duration_days || material.durationDays || 0,
    status: material.status
  };
  currentNodeId.value = nodeId;
  currentMaterialId.value = material.id;
  isEditMaterialMode.value = true;
  materialDialogVisible.value = true;
};

const handleMaterialDetail = (nodeId: number, material: Material) => {
  // 确保material对象包含前端字段名的别名
  const materialWithAliases = {
    ...material,
    // 后端字段
    id: material.id,
    node_id: material.node_id,
    name: material.name,
    description: material.description,
    start_date: material.start_date,
    expected_end_date: material.expected_end_date,
    duration_days: material.duration_days,
    status: material.status,
    created_at: material.created_at,
    updated_at: material.updated_at,
    // 前端字段别名
    startDate: material.start_date || material.startDate,
    endDate: material.expected_end_date || material.endDate,
    durationDays: material.duration_days || material.durationDays || 0
  };
  
  currentMaterialDetail.value = materialWithAliases;
  currentNodeId.value = nodeId;
  currentMaterialId.value = material.id;
  materialDetailDialogVisible.value = true;
};

// 材料日期处理函数
const handleMaterialStartDateChange = () => {
  if (materialForm.value.startDate && materialForm.value.durationDays) {
    const startDate = new Date(materialForm.value.startDate);
    materialForm.value.endDate = new Date(startDate.setDate(startDate.getDate() + materialForm.value.durationDays));
  }
};

const handleMaterialEndDateChange = () => {
  if (materialForm.value.startDate && materialForm.value.endDate) {
    const start = new Date(materialForm.value.startDate);
    const end = new Date(materialForm.value.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    materialForm.value.durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
};

const handleMaterialDurationChange = (value: number) => {
  if (materialForm.value.startDate && value) {
    const startDate = new Date(materialForm.value.startDate);
    materialForm.value.endDate = new Date(startDate.setDate(startDate.getDate() + value));
  }
};

const disableMaterialEndDateBefore = (time: Date) => {
  if (!materialForm.value.startDate) return false;
  return time.getTime() < new Date(materialForm.value.startDate).getTime();
};

// 成果相关函数
const addResult = () => {
  resultForm.value.results.push({
    description: ''
  });
};

const removeResult = (index: number) => {
  resultForm.value.results.splice(index, 1);
};

// 处理前置条件提交
const handlePrerequisiteSubmit = async () => {
  if (!prerequisiteFormRef.value) return;
  
  try {
    await prerequisiteFormRef.value.validate();
    
    if (isEditPrerequisiteMode.value && currentPrerequisiteId.value) {
      // 更新前置条件
      await updatePrerequisite(currentPrerequisiteId.value, {
        content: prerequisiteForm.value.content,
        startDate: prerequisiteForm.value.startDate || undefined,
        endDate: prerequisiteForm.value.endDate || undefined,
        status: prerequisiteForm.value.status
      });
      ElMessage({
        message: '前置条件更新成功',
        type: 'success'
      });
    } else {
      // 创建前置条件
      await createPrerequisite({
        project_id: projectId.value,
        content: prerequisiteForm.value.content,
        startDate: prerequisiteForm.value.startDate || undefined,
        endDate: prerequisiteForm.value.endDate || undefined,
        status: prerequisiteForm.value.status
      });
      ElMessage({
        message: '前置条件添加成功',
        type: 'success'
      });
    }
    
    prerequisiteDialogVisible.value = false;
    await fetchPrerequisites();
  } catch (error) {
    console.error('保存前置条件失败:', error);
    ElMessage({
      message: '保存前置条件失败',
      type: 'error'
    });
  }
};

// 删除前置条件
const handleDeletePrerequisite = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个前置条件吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await deletePrerequisite(id);
    ElMessage.success('前置条件删除成功');
    await fetchPrerequisites();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除前置条件失败:', error);
      ElMessage.error('删除前置条件失败');
    }
  }
};

// 获取前置条件状态标签类型
const getPrerequisiteStatusType = (status: string) => {
  if (!status) return 'info'; // 处理空值情况
  
  switch (status) {
    case 'pending': return 'info';
    case 'in_progress': return 'warning';
    case 'completed': return 'success';
    case 'delayed': return 'danger';
    default: return 'info';
  }
};

// 获取前置条件状态文本
const getPrerequisiteStatusText = (status: string) => {
  if (!status) return '待处理'; // 处理空值情况，默认显示为待处理
  
  switch (status) {
    case 'pending': return '待处理';
    case 'in_progress': return '进行中';
    case 'completed': return '已完成';
    case 'delayed': return '已延期';
    default: return '未知';
  }
};

// 获取状态标签类型
const getStatusTagType = (status: number) => {
  const typeMap: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger'
  };
  return typeMap[status] || 'info';
};

// 将NodeStatus枚举转换为数字
const getStatusNumber = (status: NodeStatus) => {
  switch (status) {
    case NodeStatus.NOT_STARTED: return 0;
    case NodeStatus.IN_PROGRESS: return 1;
    case NodeStatus.COMPLETED: return 2;
    case NodeStatus.BLOCKED: return 3;
    default: return 0;
  }
};

// 删除节点
const handleDeleteNode = async (nodeId: number) => {
  try {
    const confirmResult = await ElMessageBox.confirm(
      '确定要删除此节点吗？删除后将无法恢复，且节点下的所有问题、材料和交付内容也将被删除。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    if (confirmResult === 'confirm') {
      await deleteNode(projectId.value, nodeId);
      ElMessage.success('删除成功');
      // 刷新节点列表
      fetchNodes();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除节点失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 删除问题
const handleDeleteIssue = async (nodeId: number, issueId: number) => {
  try {
    const confirmResult = await ElMessageBox.confirm(
      '确定要删除此问题吗？删除后将无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    if (confirmResult === 'confirm') {
      await deleteIssue(projectId.value, nodeId, issueId);
      ElMessage.success('删除成功');
      // 刷新节点列表
      fetchNodes();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除问题失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 删除材料
const handleDeleteMaterial = async (nodeId: number, materialId: number) => {
  try {
    const confirmResult = await ElMessageBox.confirm(
      '确定要删除此材料吗？删除后将无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    if (confirmResult === 'confirm') {
      await deleteNodeMaterial(projectId.value, nodeId, materialId);
      ElMessage.success('删除成功');
      // 刷新节点列表
      fetchNodes();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除材料失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 打开节点对话框
const openNodeDialog = (node?: Node) => {
  if (node) {
    // 编辑模式
    isEditMode.value = true;
    nodeForm.value = {
      id: node.id,
      name: node.name,
      order: node.order,
      isPrerequisite: node.isPrerequisite,
      isResult: node.isResult,
      progresses: node.progresses || [],
      deliverables: []
    };
    
    // 获取节点的所有交付内容
    getDeliverables(projectId.value, node.id)
      .then(deliverables => {
        // 转换交付内容格式
        nodeForm.value.deliverables = deliverables.map(d => ({
          id: d.id,
          description: d.description,
          start_date: d.start_date,
          expected_end_date: d.expected_end_date,
          duration_days: d.duration_days || 0,
          status: d.status
        }));
      })
      .catch(error => {
        console.error('获取交付内容失败:', error);
        ElMessage.error('获取交付内容失败');
      });
  } else {
    // 添加模式
    isEditMode.value = false;
    nodeForm.value = {
      id: undefined,
      name: '',
      order: nodes.value.length + 1,
      progresses: [],
      deliverables: [],
      isPrerequisite: false,
      isResult: false
    };
  }
  
  nodeDialogVisible.value = true;
};

// 前置条件日期处理函数
const handlePrerequisiteDateChange = () => {
  if (prerequisiteForm.value.startDate && prerequisiteForm.value.endDate) {
    const startDate = new Date(prerequisiteForm.value.startDate);
    const endDate = new Date(prerequisiteForm.value.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log('计算前置条件天数:', diffDays);
  }
};

// 打开成果对话框
const openResultDialog = () => {
  // 初始化成果表单，使用项目成果数据
  resultForm.value.results = [...projectResult.value.results];
  resultDialogVisible.value = true;
};

// 打开问题对话框
const openIssueDialog = (nodeId: number) => {
  console.log('开始添加问题 - 节点ID:', nodeId);
  currentNodeId.value = nodeId;
  
  // 确保当前问题为null，表示新建问题
  currentIssue.value = null;
  
  // 重置问题表单内容，参照openMaterialDialog的做法
  issueForm.value = {
    content: '',
    status: IssueStatus.PENDING,
    startDate: null,
    expectedEndDate: null,
    durationDays: null
  };
  
  isEditIssueMode.value = false;
  // 打开对话框
  issueDialogVisible.value = true;
};

// 打开材料对话框
const openMaterialDialog = (nodeId: number) => {
  materialForm.value = {
    nodeId,
    name: '',
    description: '',
    startDate: null,
    endDate: null,
    durationDays: 0,
    status: NodeStatus.NOT_STARTED
  };
  isEditMaterialMode.value = false;
  materialDialogVisible.value = true;
};

// 打开交付内容对话框
const openDeliverableDialog = (nodeId: number, deliverable?: any) => {
  currentNodeId.value = nodeId;
  
  if (deliverable) {
    isEditDeliverableMode.value = true;
    currentDeliverableId.value = deliverable.id;
    deliverableForm.value = {
      description: deliverable.description,
      startDate: deliverable.start_date,
      endDate: deliverable.expected_end_date,
      durationDays: deliverable.duration_days || 0,
      status: deliverable.status
    };
  } else {
    isEditDeliverableMode.value = false;
    currentDeliverableId.value = null;
    deliverableForm.value = {
      description: '',
      startDate: null,
      endDate: null,
      durationDays: 0,
      status: DeliverableStatus.NOT_STARTED
    };
  }
  
  deliverableDialogVisible.value = true;
};

// 处理交付内容日期变化
const handleDeliverableDateChange = () => {
  if (deliverableForm.value.startDate && deliverableForm.value.endDate) {
    const startDate = new Date(deliverableForm.value.startDate);
    const endDate = new Date(deliverableForm.value.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    deliverableForm.value.durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
};

// 处理交付内容提交
const handleDeliverableSubmit = async () => {
  if (!deliverableFormRef.value) return;
  
  try {
    await deliverableFormRef.value.validate();
    
    if (isEditDeliverableMode.value && currentDeliverableId.value && currentNodeId.value) {
      // 更新交付内容
      await updateDeliverable(projectId.value, currentNodeId.value, currentDeliverableId.value, {
        description: deliverableForm.value.description,
        startDate: deliverableForm.value.startDate,
        endDate: deliverableForm.value.endDate,
        durationDays: deliverableForm.value.durationDays,
        status: deliverableForm.value.status
      });
      ElMessage.success('交付内容更新成功');
    } else if (currentNodeId.value) {
      // 创建交付内容
      await createDeliverable(projectId.value, currentNodeId.value, {
        nodeId: currentNodeId.value,
        description: deliverableForm.value.description,
        startDate: deliverableForm.value.startDate,
        endDate: deliverableForm.value.endDate,
        durationDays: deliverableForm.value.durationDays,
        status: deliverableForm.value.status
      });
      ElMessage.success('交付内容添加成功');
    }
    
    deliverableDialogVisible.value = false;
    await fetchNodes();
  } catch (error) {
    console.error('保存交付内容失败:', error);
    ElMessage.error('保存交付内容失败');
  }
};

// 折叠控制
const toggleDeliverables = (nodeId: number) => {
  if (foldedDeliverables.value.has(nodeId)) {
    foldedDeliverables.value.delete(nodeId);
  } else {
    foldedDeliverables.value.add(nodeId);
  }
};

const isDeliverablesFolded = (nodeId: number) => foldedDeliverables.value.has(nodeId);

// 折叠控制
const toggleIssues = (nodeId: number) => {
  if (foldedIssues.value.has(nodeId)) {
    foldedIssues.value.delete(nodeId);
  } else {
    foldedIssues.value.add(nodeId);
  }
};

const isIssuesFolded = (nodeId: number) => foldedIssues.value.has(nodeId);

const toggleMaterials = (nodeId: number) => {
  if (foldedMaterials.value.has(nodeId)) {
    foldedMaterials.value.delete(nodeId);
  } else {
    foldedMaterials.value.add(nodeId);
  }
};

const isMaterialsFolded = (nodeId: number) => foldedMaterials.value.has(nodeId);

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'not_started': '未开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'blocked': '已阻塞',
    'delayed': '已延期'
  };
  return statusMap[status] || '未知';
};

// 添加取消函数
const handleIssueCancel = () => {
  console.log('取消问题表单');
  issueDialogVisible.value = false;
};

// 对话框关闭后的处理函数
const handleDialogClosed = () => {
  console.log('问题对话框已关闭，重置状态');
  // 重置相关状态
  currentIssue.value = null;
  // 重置表单数据
  issueForm.value = {
    content: '',
    status: IssueStatus.PENDING,
    startDate: null,
    expectedEndDate: null,
    durationDays: null
  };
};

// 从详情页编辑问题
const handleEditIssueFromDetail = () => {
  if (currentIssueDetail.value && currentNodeId.value) {
    // 准备编辑数据
    const editIssue = {
      ...currentIssueDetail.value,
      // 确保使用content字段，不再使用description
      // content: currentIssueDetail.value.content || currentIssueDetail.value.description
    };
    
    // 关闭详情对话框
    issueDetailDialogVisible.value = false;
    // 打开编辑对话框
    handleEditIssue(currentNodeId.value, editIssue);
  }
};

// 处理成果提交
const handleResultSubmit = async () => {
  try {
    if (resultForm.value.results.length === 0) {
      ElMessage.warning('请至少添加一个成果');
      return;
    }
    
    // 检查每个成果是否有描述
    for (const result of resultForm.value.results) {
      if (!result.description.trim()) {
        ElMessage.warning('成果描述不能为空');
        return;
      }
    }
    
    saveLoading.value = true;
    console.log('提交成果:', resultForm.value);
    
    await updateProjectResult(projectId.value, {
      results: resultForm.value.results
    });
    
    // 更新本地状态
    projectResult.value.results = [...resultForm.value.results];
    
    ElMessage.success('成果保存成功');
    resultDialogVisible.value = false;
    await fetchProjectInfo();
  } catch (error) {
    console.error('保存成果失败:', error);
    ElMessage.error('保存成果失败');
  } finally {
    saveLoading.value = false;
  }
};

// 处理问题提交
const handleIssueSubmit = async (data: {
  content: string;
  status: IssueStatus;
  start_date: string | null;
  expected_end_date: string | null;
  duration_days: number | null;
}) => {
  console.log('提交问题表单 - 数据:', data);
  console.log('当前节点ID:', currentNodeId.value);
  console.log('当前问题:', currentIssue.value);
  
  if (!projectId.value || !currentNodeId.value) {
    console.error('项目ID或节点ID不存在');
    ElMessage.error('无法提交问题：项目ID或节点ID不存在');
    return;
  }

  // 添加前端验证
  if (!data.content || data.content.trim() === '') {
    console.error('问题描述不能为空');
    ElMessage.error('问题描述不能为空');
    return;
  }
  
  try {
    let result;
    if (currentIssue.value) {
      // 更新已有问题
      console.log('更新问题 - 发送数据:', {
        content: data.content,
        status: data.status,
        start_date: data.start_date,
        expected_end_date: data.expected_end_date,
        duration_days: data.duration_days
      });
      
      result = await updateIssue(
        projectId.value,
        currentNodeId.value,
        currentIssue.value.id,
        {
          content: data.content,
          status: data.status,
          start_date: data.start_date,
          expected_end_date: data.expected_end_date,
          duration_days: data.duration_days
        }
      );
      console.log('更新问题 - 返回结果:', result);
      ElMessage.success('问题更新成功');
    } else {
      // 创建新问题
      console.log('创建问题 - 发送数据:', {
        content: data.content,
        status: data.status,
        start_date: data.start_date,
        expected_end_date: data.expected_end_date,
        duration_days: data.duration_days
      });
      
      result = await createIssue(
        projectId.value,
        currentNodeId.value,
        {
          content: data.content,
          status: data.status,
          start_date: data.start_date,
          expected_end_date: data.expected_end_date,
          duration_days: data.duration_days
        }
      );
      console.log('创建问题 - 返回结果:', result);
      ElMessage.success('问题创建成功');
    }
    
    issueDialogVisible.value = false;
    await fetchNodes();
    
    // 提交成功后重置状态
    currentIssue.value = null;
    
  } catch (error) {
    console.error('保存问题失败:', error);
    console.error('错误详情:', {
      projectId: projectId.value,
      nodeId: currentNodeId.value,
      issueId: currentIssue.value?.id,
      formData: data
    });
    ElMessage.error(error instanceof Error ? error.message : '保存问题失败');
  }
};

// 保存材料
const handleSaveMaterial = async () => {
  try {
    await materialFormRef.value?.validate();
    
    const materialData = {
      name: materialForm.value.name,
      description: materialForm.value.description,
      startDate: materialForm.value.startDate,  // 使用API期望的字段名
      endDate: materialForm.value.endDate,  // 使用API期望的字段名
      durationDays: materialForm.value.durationDays,  // 使用API期望的字段名
      status: materialForm.value.status
    };
    
    if (isEditMaterialMode.value && currentMaterialId.value) {
      await updateNodeMaterial(
        projectId.value, 
        materialForm.value.nodeId, 
        currentMaterialId.value, 
        materialData
      );
      ElMessage.success('材料更新成功');
    } else {
      await createNodeMaterial(
        projectId.value, 
        materialForm.value.nodeId, 
        materialData
      );
      ElMessage.success('材料创建成功');
    }
    
    materialDialogVisible.value = false;
    await fetchNodes();
  } catch (error) {
    console.error('保存材料失败:', error);
    ElMessage.error('保存材料失败');
  }
};

// 编辑交付内容
const handleEditDeliverable = async (nodeId: number, deliverable: any) => {
  // 打开节点对话框，并加载交付内容
  isEditMode.value = true;
  const node = nodes.value.find(n => n.id === nodeId);
  if (!node) {
    ElMessage.error('找不到对应的节点');
    return;
  }
  
  // 设置当前节点ID，用于后续操作
  currentNodeId.value = nodeId;
  
  nodeForm.value = {
    id: node.id,
    name: node.name,
    order: node.order,
    isPrerequisite: node.isPrerequisite,
    isResult: node.isResult,
    progresses: node.progresses || [],
    deliverables: []
  };
  
  // 获取节点的所有交付内容
  try {
    const deliverables = await getDeliverables(projectId.value, nodeId);
    
    // 使用转换后的DeliverableUI对象
    nodeForm.value.deliverables = deliverables.map(d => ({
      id: d.id,
      description: d.description,
      start_date: d.start_date,
      expected_end_date: d.expected_end_date,
      duration_days: d.duration_days || 0,
      status: d.status
    }));
    
    nodeDialogVisible.value = true;
  } catch (error) {
    console.error('获取交付内容失败:', error);
    ElMessage.error('获取交付内容失败');
    }
};

// 删除交付内容
const handleDeleteDeliverable = async (nodeId: number, deliverableId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个交付内容吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await deleteDeliverable(projectId.value, nodeId, deliverableId);
    ElMessage.success('删除成功');
    fetchNodes();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除交付内容失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 打开节点详情
const handleNodeDetail = (node: Node) => {
  currentNodeDetail.value = node;
  nodeDetailDialogVisible.value = true;
};

// 初始化
onMounted(async () => {
  await fetchProjectInfo();
  await fetchPrerequisites();
  await fetchNodes();
});

// 前置条件相关
const openPrerequisiteDialog = (prerequisite?: any) => {
  if (prerequisite) {
    isEditPrerequisiteMode.value = true;
    currentPrerequisiteId.value = prerequisite.id;
    prerequisiteForm.value = {
      content: prerequisite.content,
      startDate: prerequisite.startDate,
      endDate: prerequisite.endDate,
      status: prerequisite.status
    };
  } else {
    isEditPrerequisiteMode.value = false;
    currentPrerequisiteId.value = null;
    prerequisiteForm.value = {
      content: '',
      startDate: null,
      endDate: null,
      status: 'pending'
    };
  }
  prerequisiteDialogVisible.value = true;
};

// 添加日期格式化函数
const formatDate = (date: string | Date | null) => {
  if (!date) return '未设置';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString();
};
</script>

<style scoped>
.node-list-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.node-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.sub-section {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.sub-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.sub-section-header h4 {
  margin: 0;
}

.prerequisite-card {
  background-color: #f8f9fa;
  border-left: 4px solid #e6a23c;
}

.result-card {
  background-color: #f8f9fa;
  border-left: 4px solid #67c23a;
}

.result-list {
  margin-top: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-title {
  font-weight: bold;
  font-size: 16px;
}

.result-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-item {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  background-color: #fff;
}

.result-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.result-index {
  font-weight: bold;
}

.result-items-display {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-item-display {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  background-color: #fff;
}

.result-item-header {
  margin-bottom: 10px;
}

.result-description {
  margin: 0;
  white-space: pre-line;
}

.detail-description-item {
  margin-bottom: 8px;
  white-space: pre-line;
}

.detail-description-item:last-child {
  margin-bottom: 0;
}

.dialog-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.issue-detail, .material-detail, .node-detail {
  padding: 10px;
}

/* 交付内容样式 */
.deliverables-section {
  margin-top: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
}

.deliverables-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.deliverable-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  background-color: #f8f9fa;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: bold;
}
</style> 