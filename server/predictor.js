import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MODEL_PATH = join(__dirname, '../src/model/final_hypertension_xgb_model.json')

export const FEATURE_NAMES = [
  'RIDAGEYR',
  'RIAGENDR',
  'RIDRETH1',
  'RIDEXPRG',
  'SLD010H',
  'SLQ050',
  'SLQ060',
]

function loadModel() {
  const model = JSON.parse(readFileSync(MODEL_PATH, 'utf8'))
  const baseScore = parseFloat(
    model.learner.learner_model_param.base_score.replace(/[[\]]/g, ''),
  )
  const trees = model.learner.gradient_booster.model.trees

  return { baseScore, trees }
}

function predictTree(tree, features, node = 0) {
  while (tree.left_children[node] !== -1) {
    const featureIndex = tree.split_indices[node]
    const value = features[featureIndex]
    const threshold = tree.split_conditions[node]

    if (value === undefined || value === null || Number.isNaN(value)) {
      node = tree.default_left[node]
        ? tree.left_children[node]
        : tree.right_children[node]
    } else if (value < threshold) {
      node = tree.left_children[node]
    } else {
      node = tree.right_children[node]
    }
  }

  return tree.base_weights[node]
}

const { baseScore, trees } = loadModel()

export function predict(features) {
  if (features.length !== FEATURE_NAMES.length) {
    throw new Error(
      `Expected ${FEATURE_NAMES.length} features, received ${features.length}`,
    )
  }

  let sum = baseScore
  for (const tree of trees) {
    sum += predictTree(tree, features)
  }

  return 1 / (1 + Math.exp(-sum))
}
