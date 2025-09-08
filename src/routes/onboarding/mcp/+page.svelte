<script lang="ts">
    import { goto } from '$app/navigation';

    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import LabeledSection from '$components/Forms/LabeledSection.svelte';
    import Icon from '$components/Icon.svelte';
    import Input from '$components/Input.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Modal from '$components/Modal.svelte';
    import { McpServer } from '$lib/models';

    async function later() {
        await goto('/chat/latest');
    }

    async function install() {
        await McpServer.create({
            command: 'npx',
            args: ['@playwright/mcp@latest'],
        });

        await goto('/chat/latest');
    }
</script>

<Layout>
    <Modal class="border-light border p-0">
        <Flex class="bg-dark border-light w-full flex-0 border-b p-3 pl-6">
            <Flex class="text-purple w-full">
                <Icon name="MCP" class="text-light mr-2 h-4 w-4" />
                <p>Play around with MCP</p>
            </Flex>
        </Flex>

        <Flex class="bg-medium flex-col items-center p-8 pt-4">
            <Flex class="border-light w-full flex-col items-start rounded-md border">
                <LabeledSection icon="Command" title="Command">
                    <Input value="npx @playwright/mcp@latest" />
                </LabeledSection>
            </Flex>
        </Flex>

        <Flex
            class="bg-dark border-light w-full justify-center gap-4
            rounded-b-xl border-t p-4"
        >
            <Button
                onclick={later}
                class="bg-light text-medium w-full border-none text-xs font-semibold uppercase"
            >
                Maybe Later
            </Button>

            <Flex class="w-full justify-center">
                <Button
                    onclick={install}
                    class="bg-purple text-dark w-full border-none text-xs font-semibold
                    uppercase disabled:opacity-25"
                >
                    Continue
                </Button>
            </Flex>
        </Flex>
    </Modal>
</Layout>
