#!/usr/bin/env node

/**
 * 检查中文翻译是否与英语同步
 * 检测英语中存在但中文中缺失的翻译键
 */

const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../src/locales/en.json');
const zhPath = path.join(__dirname, '../src/locales/zh.json');

console.log('🔍 检查翻译同步状态...\n');

// 读取文件
let en, zh;
try {
  en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  zh = JSON.parse(fs.readFileSync(zhPath, 'utf8'));
} catch (err) {
  console.error('❌ 读取翻译文件失败:', err.message);
  process.exit(1);
}

/**
 * 递归查找缺失的键
 */
function findMissingKeys(sourceObj, targetObj, prefix = '') {
  const missing = [];
  const keys = Object.keys(sourceObj);

  for (const key of keys) {
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (!(key in targetObj)) {
      missing.push({
        path: fullPath,
        value: sourceObj[key]
      });
    } else if (
      typeof sourceObj[key] === 'object' &&
      typeof targetObj[key] === 'object' &&
      sourceObj[key] !== null &&
      targetObj[key] !== null
    ) {
      // 递归检查嵌套对象
      missing.push(...findMissingKeys(sourceObj[key], targetObj[key], fullPath));
    }
  }

  return missing;
}

/**
 * 统计键的数量
 */
function countKeys(obj, prefix = '') {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key], prefix ? `${prefix}.${key}` : key);
    } else {
      count++;
    }
  }
  return count;
}

// 检查缺失的翻译
const missingKeys = findMissingKeys(en, zh);

// 统计
const enKeyCount = countKeys(en);
const zhKeyCount = countKeys(zh);

console.log(`📊 翻译统计:`);
console.log(`   英语翻译键: ${enKeyCount}`);
console.log(`   中文翻译键: ${zhKeyCount}`);
console.log(`   缺失键数: ${missingKeys.length}\n`);

if (missingKeys.length > 0) {
  console.log('⚠️  以下翻译键在中文文件中缺失:\n');

  // 按模块分组显示
  const grouped = {};
  missingKeys.forEach(item => {
    const module = item.path.split('.')[0];
    if (!grouped[module]) grouped[module] = [];
    grouped[module].push(item);
  });

  Object.keys(grouped).forEach(module => {
    console.log(`📁 ${module}:`);
    grouped[module].forEach(item => {
      console.log(`   - ${item.path}`);
      console.log(`     值: ${JSON.stringify(item.value).substring(0, 60)}...`);
    });
    console.log('');
  });

  console.log('❌ 检查失败!请在 src/locales/zh.json 中添加缺失的翻译。\n');
  console.log('💡 提示: 可以参考 en.json 中的对应键值进行翻译。\n');
  process.exit(1);
} else {
  console.log('✅ 所有翻译键已同步!\n');

  // 检查是否有多余的键(英语中不存在)
  const extraKeys = findMissingKeys(zh, en);
  if (extraKeys.length > 0) {
    console.log('⚠️  注意: 中文文件中有以下键在英语中不存在:\n');
    extraKeys.slice(0, 10).forEach(item => {
      console.log(`   - ${item.path}`);
    });
    if (extraKeys.length > 10) {
      console.log(`   ... 还有 ${extraKeys.length - 10} 个`);
    }
    console.log('\n💡 这些可能是过时的翻译键,建议删除。\n');
  }

  console.log('✅ 翻译检查通过!');
  process.exit(0);
}
