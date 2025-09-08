<script lang="ts">
    import Flex from '$components/Flex.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Link from '$components/Link.svelte';
    import Modal from '$components/Modal.svelte';
    import Svg from '$components/Svg.svelte';
</script>

<Layout>
    <Modal class="border-light border p-0">
        <Flex class="bg-dark border-light w-full flex-0 border-b p-3 pl-6">
            <Flex class="text-purple w-full">
                <img class="mr-2 h-6 w-6" src="/images/tome.png" alt="tome" />
                <p>Welcome to Tome</p>
            </Flex>
        </Flex>

        <Flex class="bg-medium flex-col items-center p-8 pt-4">
            <p class="mb-4">We couldn't find any of your LLMs. Get started:</p>

            <Flex class="w-full gap-8">
                <Link
                    href="/onboarding/models/ollama"
                    class="border-xlight bg-light hover:border-purple/25 flex w-full
                    flex-col items-center justify-center rounded-lg border
                    py-8 transition-all duration-300"
                >
                    <h2 class="mb-2 text-2xl">Ollama</h2>
                    <Svg name="Ollama" class="h-12 w-12" />
                </Link>

                <Link
                    href="/onboarding/models/openai"
                    class="border-xlight bg-light hover:border-purple/25
                    flex w-full flex-col items-center justify-center
                    rounded-lg border py-8 transition-all duration-300"
                >
                    <h2 class="mb-2 text-2xl">OpenAI</h2>
                    <Svg name="Openai" class="h-12 w-12" />
                </Link>

                <Link
                    href="/onboarding/models/gemini"
                    class="border-xlight bg-light hover:border-purple/25 flex w-full
                    flex-col items-center justify-center rounded-lg border py-8
                    transition-all duration-300"
                >
                    <h2 class="mb-2 text-2xl">Gemini</h2>
                    <Svg name="Gemini" class="h-12 w-12" />
                </Link>

                <Link
                    href="/onboarding/models/other"
                    class="border-xlight bg-light hover:border-purple/25 flex w-full
                    flex-col items-center justify-center rounded-lg border py-8
                    transition-all duration-300"
                >
                    <h2 class="mb-2 text-2xl">Other</h2>
                    <Svg name="Models" class="h-12 w-12" />
                </Link>
            </Flex>
        </Flex>
    </Modal>
</Layout>
