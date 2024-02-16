'use client';
import { Button } from '@/components/button';
import { useState } from 'react';
import dedent from 'dedent';

const newLine = '_NEWLINE_';

const tabs = {
  curl: [
    {
      title: 'Create a new client',
      code: dedent`curl -X POST https://feetchair.fish.lgbt/api/client -H "Content-Type: application/json"`,
    },
    {
      title: 'Create a flag',
      // The client id and secret need to be included as headers
      code: dedent`
        curl -X POST https://feetchair.fish.lgbt/api/flag -H "Content-Type: application/json"
        -H "Client-Id: 123e4567-e89b-12d3-a456-426614174000"
        -H "Client-Secret: 7afd0a52-e637-465e-91eb-d58875aa6c0a"
        -d '{"name": "feature-flag", "description": "A new feature flag", "active": true}'
      `,
    },
  ],
  js: [
    {
      title: 'Create a new client',
      code: dedent`
        const client = fetch('https://feetchair.fish.lgbt/api/client', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
        });
        console.info('Client ID:', client.clientId); // 123e4567-e89b-12d3-a456-426614174000
        console.info('Client Secret:', client.clientSecret); // 7afd0a52-e637-465e-91eb-d58875aa6c0a
      `,
    },
  ],
  php: [
    {
      title: 'Create a new client',
      code: dedent`
        $options = array(
          'http' => array(
            'header'  => "Content-type: application/json",
            'method'  => 'POST',
          ),
        );
        $context  = stream_context_create($options);
        $result = file_get_contents('https://feetchair.fish.lgbt/api/client', false, $context);
        if ($result === FALSE) {
          echo "Failed to create client.";
        } else {
          echo "Client ID: " . $result->clientId . "${newLine}";
          echo "Client Secret: " . $result->clientSecret . "${newLine}";
        }
      `.replaceAll('_NEWLINE_', '\\n'),
    },
  ],
} as const;

type Tab = keyof typeof tabs;
const tabNames = Object.keys(tabs) as Tab[];

export default function Home() {
  const [activeTab, setActiveTab] = useState<keyof typeof tabs>('js');

  return (
    <main className="flex flex-col py-2 gap-2 items-center align-middle">
      <div className="flex flex-row gap-2">
        {/* Tab Headers */}
        {tabNames.map((tab) => (
          <Button key={tab} onClick={() => setActiveTab(tab)}>
            {tab.toUpperCase()}
          </Button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="flex flex-col gap-2">
        {tabs[activeTab].map(({ title, code }, i) => (
          <div key={i}>
            <h2>{title}</h2>
            <pre className="border p-2">
              <code>{code}</code>
            </pre>
          </div>
        ))}
      </div>
    </main>
  );
}
