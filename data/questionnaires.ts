// ─── Questionnaire definitions per DevOps tool ───────────────────────────────
// To add a new tool: add a new entry to TOOL_QUESTIONNAIRES.
// To add questions: add to the tool's questions array.

export type QuestionType = 'select' | 'yes-no' | 'text' | 'textarea';

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];          // for 'select'
  placeholder?: string;
  comment?: string;            // help text shown below the field
  conditionalOn?: {            // only show this field when another field equals value
    questionId: string;
    value: string;
  };
}

export interface ToolQuestionnaire {
  id: string;        // used as the tab key
  label: string;     // display name
  questions: Question[];
}

export const TOOL_QUESTIONNAIRES: ToolQuestionnaire[] = [
  // ── SonarQube ──────────────────────────────────────────────────────────────
  {
    id: 'sonarqube',
    label: 'SonarQube',
    questions: [
      {
        id: 'license_type',
        label: 'SonarQube License Type',
        type: 'select',
        options: ['Community', 'Developer', 'Enterprise', 'Data Center'],
        comment: 'Specify current or desired license type.',
      },
      {
        id: 'license_tier',
        label: 'SonarQube License Tier',
        type: 'select',
        options: ['5M LOC', '10M LOC', '20M LOC', '20M+ LOC', 'Not sure'],
        comment: 'Specify Lines of Code tier needed (e.g., 5M, 10M, 20M+).',
      },
      {
        id: 'private_connectivity',
        label: 'Private Connectivity',
        type: 'yes-no',
        comment: 'We provide encrypted over internet (HTTPS) by default. Select Yes if you require private/VPN connectivity.',
      },
      {
        id: 'cross_region_dr',
        label: 'Cross-region Disaster Recovery',
        type: 'yes-no',
        comment: 'Secondary region deployment for high availability.',
      },
      {
        id: 'custom_domain',
        label: 'Custom Domain',
        type: 'yes-no',
        comment: 'We provide {customer}.devopsx.io by default. Select Yes if you need a custom domain.',
      },
      {
        id: 'custom_domain_value',
        label: 'Custom Domain Name',
        type: 'text',
        placeholder: 'e.g., sonar.customer.com',
        conditionalOn: { questionId: 'custom_domain', value: 'Yes' },
      },
      {
        id: 'nonprod_environment',
        label: 'Non-prod Environment',
        type: 'yes-no',
        comment: 'Additional environment for testing, separate from Production.',
      },
      {
        id: 'migration_needed',
        label: 'Migration Needed',
        type: 'yes-no',
        comment: 'We can support migrating from on-prem SonarQube to iTmethods managed SonarQube.',
      },
      {
        id: 'current_version',
        label: 'Current SonarQube Version',
        type: 'text',
        placeholder: 'e.g., 9.9 LTS',
        comment: 'Only required if migration = Yes.',
        conditionalOn: { questionId: 'migration_needed', value: 'Yes' },
      },
      {
        id: 'current_db_type',
        label: 'Current Database Type',
        type: 'select',
        options: ['PostgreSQL', 'Oracle', 'Microsoft SQL Server', 'Other'],
        comment: 'Only required if migration = Yes.',
        conditionalOn: { questionId: 'migration_needed', value: 'Yes' },
      },
      {
        id: 'current_db_version',
        label: 'Current Database Version',
        type: 'text',
        placeholder: 'e.g., PostgreSQL 12',
        comment: 'Only required if migration = Yes.',
        conditionalOn: { questionId: 'migration_needed', value: 'Yes' },
      },
      {
        id: 'custom_plugins',
        label: 'Custom Plugins',
        type: 'textarea',
        placeholder: 'List plugin names and versions, one per line...',
        comment: 'Only required if migration = Yes. Provide plugin names + versions critical for migration.',
        conditionalOn: { questionId: 'migration_needed', value: 'Yes' },
      },
    ],
  },

  // ── GitLab ─────────────────────────────────────────────────────────────────
  {
    id: 'gitlab',
    label: 'GitLab',
    questions: [
      {
        id: 'license_type',
        label: 'GitLab License Type',
        type: 'select',
        options: ['Community Edition (CE)', 'Premium', 'Ultimate'],
        comment: 'Specify current or desired GitLab edition.',
      },
      {
        id: 'user_count',
        label: 'Estimated User Count',
        type: 'select',
        options: ['< 50', '50–200', '200–500', '500–1000', '1000–5000', '5000+'],
        comment: 'Total number of GitLab users.',
      },
      {
        id: 'private_connectivity',
        label: 'Private Connectivity',
        type: 'yes-no',
        comment: 'We provide encrypted over internet (HTTPS) by default.',
      },
      {
        id: 'cross_region_dr',
        label: 'Cross-region Disaster Recovery',
        type: 'yes-no',
        comment: 'Secondary region deployment for high availability.',
      },
      {
        id: 'custom_domain',
        label: 'Custom Domain',
        type: 'yes-no',
        comment: 'We provide {customer}.devopsx.io by default.',
      },
      {
        id: 'custom_domain_value',
        label: 'Custom Domain Name',
        type: 'text',
        placeholder: 'e.g., gitlab.customer.com',
        conditionalOn: { questionId: 'custom_domain', value: 'Yes' },
      },
      {
        id: 'nonprod_environment',
        label: 'Non-prod Environment',
        type: 'yes-no',
        comment: 'Additional environment for testing, separate from Production.',
      },
      {
        id: 'runners_needed',
        label: 'Managed Runners / Agents',
        type: 'yes-no',
        comment: 'Do you require iTmethods managed GitLab runners?',
      },
      {
        id: 'migration_needed',
        label: 'Migration Needed',
        type: 'yes-no',
        comment: 'Migrating from self-managed GitLab or another SCM (GitHub, Bitbucket, etc.).',
      },
      {
        id: 'migration_source',
        label: 'Migration Source',
        type: 'select',
        options: ['Self-managed GitLab', 'GitHub', 'Bitbucket', 'Azure DevOps', 'Other'],
        comment: 'Source system for migration.',
        conditionalOn: { questionId: 'migration_needed', value: 'Yes' },
      },
      {
        id: 'repo_count',
        label: 'Approximate Repository Count',
        type: 'text',
        placeholder: 'e.g., 150',
        comment: 'Only required if migration = Yes.',
        conditionalOn: { questionId: 'migration_needed', value: 'Yes' },
      },
      {
        id: 'additional_notes',
        label: 'Additional Notes',
        type: 'textarea',
        placeholder: 'Any other requirements or context...',
      },
    ],
  },

  // ── GitHub ─────────────────────────────────────────────────────────────────
  {
    id: 'github',
    label: 'GitHub',
    questions: [
      {
        id: 'license_type',
        label: 'GitHub License Type',
        type: 'select',
        options: ['GitHub Free', 'GitHub Team', 'GitHub Enterprise Cloud', 'GitHub Enterprise Server'],
        comment: 'Specify desired GitHub plan.',
      },
      {
        id: 'user_count',
        label: 'Estimated User Count',
        type: 'select',
        options: ['< 50', '50–200', '200–500', '500–1000', '1000–5000', '5000+'],
        comment: 'Total number of GitHub users.',
      },
      {
        id: 'private_connectivity',
        label: 'Private Connectivity',
        type: 'yes-no',
        comment: 'We provide encrypted over internet (HTTPS) by default.',
      },
      {
        id: 'github_actions',
        label: 'GitHub Actions Required',
        type: 'yes-no',
        comment: 'Do you require GitHub Actions for CI/CD pipelines?',
      },
      {
        id: 'self_hosted_runners',
        label: 'Self-hosted Runners',
        type: 'yes-no',
        comment: 'Do you require self-hosted or managed runners for GitHub Actions?',
        conditionalOn: { questionId: 'github_actions', value: 'Yes' },
      },
      {
        id: 'advanced_security',
        label: 'GitHub Advanced Security',
        type: 'yes-no',
        comment: 'Code scanning, secret scanning, and dependency review.',
      },
      {
        id: 'nonprod_environment',
        label: 'Non-prod Environment',
        type: 'yes-no',
        comment: 'Additional environment for testing, separate from Production.',
      },
      {
        id: 'migration_needed',
        label: 'Migration Needed',
        type: 'yes-no',
        comment: 'Migrating from another SCM (GitLab, Bitbucket, Azure DevOps, etc.).',
      },
      {
        id: 'migration_source',
        label: 'Migration Source',
        type: 'select',
        options: ['GitLab', 'Bitbucket', 'Azure DevOps', 'Self-managed GitHub', 'Other'],
        comment: 'Source system for migration.',
        conditionalOn: { questionId: 'migration_needed', value: 'Yes' },
      },
      {
        id: 'repo_count',
        label: 'Approximate Repository Count',
        type: 'text',
        placeholder: 'e.g., 250',
        conditionalOn: { questionId: 'migration_needed', value: 'Yes' },
      },
      {
        id: 'additional_notes',
        label: 'Additional Notes',
        type: 'textarea',
        placeholder: 'Any other requirements or context...',
      },
    ],
  },

  // ── Artifactory ────────────────────────────────────────────────────────────
  {
    id: 'artifactory',
    label: 'Artifactory',
    questions: [
      {
        id: 'license_type',
        label: 'Artifactory License Type',
        type: 'select',
        options: ['OSS', 'Pro', 'Pro X', 'Enterprise', 'Enterprise+'],
        comment: 'Specify current or desired JFrog Artifactory license.',
      },
      {
        id: 'xray_needed',
        label: 'JFrog Xray (Security Scanning)',
        type: 'yes-no',
        comment: 'Do you require JFrog Xray for vulnerability and license compliance scanning?',
      },
      {
        id: 'repo_types',
        label: 'Repository Types Needed',
        type: 'textarea',
        placeholder: 'e.g., Maven, npm, Docker, PyPI, NuGet...',
        comment: 'List the package formats/repository types required.',
      },
      {
        id: 'storage_estimate',
        label: 'Estimated Storage (GB)',
        type: 'text',
        placeholder: 'e.g., 500',
        comment: 'Approximate artifact storage requirement in GB.',
      },
      {
        id: 'private_connectivity',
        label: 'Private Connectivity',
        type: 'yes-no',
        comment: 'We provide encrypted over internet (HTTPS) by default.',
      },
      {
        id: 'cross_region_dr',
        label: 'Cross-region Disaster Recovery',
        type: 'yes-no',
        comment: 'Secondary region deployment for high availability.',
      },
      {
        id: 'custom_domain',
        label: 'Custom Domain',
        type: 'yes-no',
        comment: 'We provide {customer}.devopsx.io by default.',
      },
      {
        id: 'custom_domain_value',
        label: 'Custom Domain Name',
        type: 'text',
        placeholder: 'e.g., artifacts.customer.com',
        conditionalOn: { questionId: 'custom_domain', value: 'Yes' },
      },
      {
        id: 'nonprod_environment',
        label: 'Non-prod Environment',
        type: 'yes-no',
        comment: 'Additional environment for testing, separate from Production.',
      },
      {
        id: 'migration_needed',
        label: 'Migration Needed',
        type: 'yes-no',
        comment: 'Migrating from self-managed Artifactory or another artifact repository.',
      },
      {
        id: 'current_version',
        label: 'Current Artifactory Version',
        type: 'text',
        placeholder: 'e.g., 7.55',
        conditionalOn: { questionId: 'migration_needed', value: 'Yes' },
      },
      {
        id: 'current_db_type',
        label: 'Current Database Type',
        type: 'select',
        options: ['PostgreSQL', 'MySQL', 'Oracle', 'Microsoft SQL Server', 'Derby (embedded)', 'Other'],
        conditionalOn: { questionId: 'migration_needed', value: 'Yes' },
      },
      {
        id: 'additional_notes',
        label: 'Additional Notes',
        type: 'textarea',
        placeholder: 'Any other requirements or context...',
      },
    ],
  },
];
