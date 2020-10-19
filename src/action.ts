import * as core from '@actions/core'
import * as github from '@actions/github'
import { Util } from './util'

export namespace Action {
  export async function run() {
    try {
      const context = github.context
      const payload = context.payload.issue || context.payload.pull_request

      if (
        !Util.isValidEvent('issues', 'opened') ||
        !Util.isValidEvent('pull_request', 'opened') ||
        !payload
      ) {
        core.warning('This action is only supposed on issues or PRs opened.')
        return
      }

      const { repo, owner } = context.repo
      const type = context.payload.issue ? 'issue' : 'pr'
      const label = core.getInput('label') || 'visitors'
      const color = core.getInput('color')
      const style = core.getInput('style')

      let badge = `![${label}](https://komarev.com/ghpvc/?username=${owner}.${repo}.${type}.${
        payload.number
      })&label=${label.replace(/\s+/g, '+')}`
      if (color) {
        badge += `&color=${color}`
      }

      if (style) {
        badge += `&style=${style}`
      }

      const octokit = Util.getOctokit()
      octokit.issues.update({
        repo,
        owner,
        issue_number: payload.number,
        body: `${badge}\n${payload.body}`,
      })
    } catch (e) {
      core.error(e)
      core.setFailed(e.message)
    }
  }
}
