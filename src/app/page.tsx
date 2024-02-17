'use client';
import 'highlight.js/styles/github-dark.css';

import hljs from 'highlight.js';
import js from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import ruby from 'highlight.js/lib/languages/ruby';
import php from 'highlight.js/lib/languages/php';
import { Button } from '@/components/button';
import { useEffect, useRef, useState } from 'react';
import d from 'dedent';
import { cn } from '@/cn';

hljs.registerLanguage('js', js);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('php', php);

const newLine = '_NEWLINE_';

const dedent = d.withOptions({
  escapeSpecialCharacters: false,
});

const tabs = {
  curl: [
    {
      title: 'Create a new client',
      language: 'bash',
      code: dedent`
        # Make the POST request and capture the response
        response=$(curl -s -X POST https://feetchair.fish.lgbt/api/client -H "Content-Type: application/json")
        
        # Use jq to parse the JSON response and extract clientId and clientSecret
        clientId=$(echo $response | jq -r '.clientId')
        clientSecret=$(echo $response | jq -r '.clientSecret')
        
        # Set the environment variables
        export FEETCHAIR_CLIENT_ID=$clientId
        export FEETCHAIR_CLIENT_SECRET=$clientSecret
        
        # Optionally, print the variables to confirm
        echo "FEETCHAIR_CLIENT_ID is set to $FEETCHAIR_CLIENT_ID"
        echo "FEETCHAIR_CLIENT_SECRET is set to $FEETCHAIR_CLIENT_SECRET"
      `,
    },
    {
      title: 'Create a flag',
      language: 'bash',
      code: dedent`
        # Make the POST request to create a new flag
        curl -X POST https://feetchair.fish.lgbt/api/flag \
             -H "Content-Type: application/json" \
             -H "x-client-id: $FEETCHAIR_CLIENT_ID" \
             -H "x-client-secret: $FEETCHAIR_CLIENT_SECRET" \
             -d '{"name": "feature-flag", "description": "A new feature flag", "enabled": true}' 
      `,
    },
    {
      title: 'Get all flags',
      language: 'bash',
      code: dedent`
        # Make the GET request to retrieve all flags
        curl -X GET https://feetchair.fish.lgbt/api/flags \
             -H "x-client-id: $FEETCHAIR_CLIENT_ID" \
             -H "x-client-secret: $FEETCHAIR_CLIENT_SECRET"
      `,
    },
    {
      title: 'Get a single flag',
      language: 'bash',
      code: dedent`
        # Make the GET request to retrieve a single flag
        curl -X GET https://feetchair.fish.lgbt/api/flags/123e4567-e89b-12d3-a456-426614174000 \
             -H "x-client-id: $FEETCHAIR_CLIENT_ID" \
             -H "x-client-secret: $FEETCHAIR_CLIENT_SECRET"
      `,
    },
    {
      title: 'Update a flag',
      language: 'bash',
      code: dedent`
        # Make the PUT request to update a flag
        curl -X PUT https://feetchair.fish.lgbt/api/flags/123e4567-e89b-12d3-a456-426614174000 \
             -H "Content-Type: application/json" \
             -H "x-client-id: $FEETCHAIR_CLIENT_ID" \
             -H "x-client-secret: $FEETCHAIR_CLIENT_SECRET" \
             -d '{"name": "feature-flag", "description": "A new feature flag", "enabled": false}' 
      `,
    },
    {
      title: 'Delete a flag',
      language: 'bash',
      code: dedent`
        # Make the DELETE request to delete a flag
        curl -X DELETE https://feetchair.fish.lgbt/api/flags/123e4567-e89b-12d3-a456-426614174000 \
             -H "x-client-id: $FEETCHAIR_CLIENT_ID" \
             -H "x-client-secret: $FEETCHAIR_CLIENT_SECRET"
      `,
    },
  ],
  js: [
    {
      title: 'Create a new client',
      language: 'js',
      code: dedent`
        const client = fetch('https://feetchair.fish.lgbt/api/client', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
        }).then(response => response.json());
        console.info('Client ID:', client.clientId); // 123e4567-e89b-12d3-a456-426614174000
        console.info('Client Secret:', client.clientSecret); // 7afd0a52-e637-465e-91eb-d58875aa6c0a
      `,
    },
    {
      title: 'Create a flag',
      language: 'js',
      code: dedent`
        const flag = fetch('https://feetchair.fish.lgbt/api/flag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': '123e4567-e89b-12d3-a456-426614174000',
            'x-client-secret': '7afd0a52-e637-465e-91eb-d58875aa6c0a',
          },
          body: JSON.stringify({
            name: 'feature-flag',
            description: 'A new feature flag',
            active: true,
          }),
        }).then(response => response.json());
        console.info('Flag ID:', flag.id); // 123e4567-e89b-12d3-a456-426614174000
      `,
    },
    {
      title: 'Get all flags',
      language: 'js',
      code: dedent`
        const flags = fetch('https://feetchair.fish.lgbt/api/flags', {
          headers: {
            'x-client-id': '123e4567-e89b-12d3-a456-426614174000',
            'x-client-secret': '7afd0a52-e637-465e-91eb-d58875aa6c0a',
          },
        }).then(response => response.json());
        console.info('Flags:', flags); // [{ id: '123e4567-e89b-12d3-a456-426614174000', name: 'feature-flag', description: 'A new feature flag', enabled: true }]
      `,
    },
    {
      title: 'Get a single flag',
      language: 'js',
      code: dedent`
        const flag = fetch('https://feetchair.fish.lgbt/api/flags/feature-flag', {
          headers: {
            'x-client-id': '123e4567-e89b-12d3-a456-426614174000',
            'x-client-secret': '7afd0a52-e637-465e-91eb-d58875aa6c0a',
          },
        }).then(response => response.json());
        console.info('Flag:', flag); // { id: '123e4567-e89b-12d3-a456-426614174000', name: 'feature-flag', description: 'A new feature flag', enabled: true }
      `,
    },
    {
      title: 'Update a flag',
      language: 'js',
      code: dedent`
        const flag = fetch('https://feetchair.fish.lgbt/api/flags/feature-flag', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': '123e4567-e89b-12d3-a456-426614174000',
            'x-client-secret': '7afd0-a52-e637-465e-91eb-d58875aa6c0a',
          },
          body: JSON.stringify({
            name: 'feature-flag',
            description: 'A new feature flag',
            active: false,
          }),
        });
        console.info('Flag:', flag.ok); // true
      `,
    },
    {
      title: 'Delete a flag',
      language: 'js',
      code: dedent`
        const flag = fetch('https://feetchair.fish.lgbt/api/flags/feature-flag', {
          method: 'DELETE',
          headers: {
            'x-client-id': '123e4567-e89b-12d3-a456-426614174000',
            'x-client-secret': '7afd0a52-e637-465e-91eb-d58875aa6c0a',
          },
        }).then(response => response.json());
        console.info('Flag:', flag.ok); // true
      `,
    },
  ],
  // php: [
  //   {
  //     title: 'Create a new client',
  //     language: 'php',
  //     code: dedent`
  //       $options = array(
  //         'http' => array(
  //           'header'  => "Content-type: application/json",
  //           'method'  => 'POST',
  //         ),
  //       );
  //       $context  = stream_context_create($options);
  //       $result = file_get_contents('https://feetchair.fish.lgbt/api/client', false, $context);
  //       if ($result === FALSE) {
  //         echo "Failed to create client.";
  //       } else {
  //         echo "Client ID: " . $result->clientId . "${newLine}";
  //         echo "Client Secret: " . $result->clientSecret . "${newLine}";
  //       }
  //     `.replaceAll('_NEWLINE_', '\\n'),
  //   },
  //   {
  //     title: 'Create a flag',
  //     language: 'php',
  //     code: dedent`
  //       $data = array(
  //         'name' => 'feature-flag',
  //         'description' => 'A new feature flag',
  //         'active' => true,
  //       );
  //       $options = array(
  //         'http' => array(
  //           'header'  => "Content-type: application/json",
  //           'method'  => 'POST',
  //           'content' => json_encode($data),
  //           'header' => "x-client-id: 123e4567-e89b-12d3-a456-426614174000",
  //           'header' => "x-client-secret: 7afd0a52-e637-465e-91eb-d58875aa6c0a",
  //         ),
  //       );
  //       $context  = stream_context_create($options);
  //       $result = file_get_contents('https://feetchair.fish.lgbt/api/flag', false, $context);
  //       if ($result === FALSE) {
  //         echo "Failed to create flag.";
  //       } else {
  //         echo "Flag ID: " . $result->id;
  //       }
  //     `.replaceAll('_NEWLINE_', '\\n'),
  //   },
  //   {
  //     title: 'Get all flags',
  //     language: 'php',
  //     code: dedent`
  //       $options = array(
  //         'http' => array(
  //           'header'  => "x-client-id: 123e4567-e89b-12d3-a456-426614174000",
  //           'header'  => "x-client-secret: 7afd0a52-e637-465e-91eb-d58875aa6c0a",
  //         ),
  //       );
  //       $context  = stream_context_create($options);
  //       $result = file_get_contents('https://feetchair.fish.lgbt/api/flags', false, $context);
  //       if ($result === FALSE) {
  //         echo "Failed to get flags.";
  //       } else {
  //         echo "Flags: " . $result;
  //       }
  //     `.replaceAll('_NEWLINE_', '\\n'),
  //   },
  //   {
  //     title: 'Get a single flag',
  //     language: 'php',
  //     code: dedent`
  //       $options = array(
  //         'http' => array(
  //           'header'  => "x-client-id: 123e4567-e89b-12d3-a456-426614174000",
  //           'header'  => "x-client-secret: 7afd0a52-e637-465e-91eb-d58875aa6c0a",
  //         ),
  //       );
  //       $context  = stream_context_create($options);
  //       $result = file_get_contents('https://feetchair.fish.lgbt/api/flags/feature-flag', false, $context);
  //       if ($result === FALSE) {
  //         echo "Failed to get flag.";
  //       } else {
  //         echo "Flag: " . $result;
  //       }
  //     `.replaceAll('_NEWLINE_', '\\n'),
  //   },
  // ],
  // ruby: [
  //   {
  //     title: 'Create a new client',
  //     language: 'ruby',
  //     code: dedent`
  //     require 'net/http'
  //     require 'uri'
  //     require 'json'

  //     uri = URI.parse('https://feetchair.fish.lgbt/api/client')
  //     request = Net::HTTP::Post.new(uri)
  //     request.content_type = 'application/json'

  //     req_options = {
  //       use_ssl: uri.scheme == 'https',
  //     }

  //     response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  //       http.request(request)
  //     end

  //     if response.code.to_i == 200
  //       client = JSON.parse(response.body)
  //       puts "Client ID: #{client['clientId']}"
  //       puts "Client Secret: #{client['clientSecret']}"
  //     else
  //       puts "Failed to create client."
  //     end
  //   `,
  //   },
  //   {
  //     title: 'Create a flag',
  //     language: 'ruby',
  //     code: dedent`
  //     require 'net/http'
  //     require 'uri'
  //     require 'json'

  //     uri = URI.parse('https://feetchair.fish.lgbt/api/flag')
  //     request = Net::HTTP::Post.new(uri)
  //     request.content_type = 'application/json'
  //     request['x-client-id'] = '123e4567-e89b-12d3-a456-426614174000'
  //     request['x-client-secret'] = '7afd0a52-e637-465e-91eb-d58875aa6c0a'
  //     request.body = JSON.dump({
  //       name: 'feature-flag',
  //       description: 'A new feature flag',
  //       active: true,
  //     })

  //     req_options = {
  //       use_ssl: uri.scheme == 'https',
  //     }

  //     response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  //       http.request(request)
  //     end

  //     if response.code.to_i == 200
  //       flag = JSON.parse(response.body)
  //       puts "Flag ID: #{flag['id']}"
  //     else
  //       puts "Failed to create flag."
  //     end
  //   `,
  //   },
  //   {
  //     title: 'Get all flags',
  //     language: 'ruby',
  //     code: dedent`
  //     require 'net/http'
  //     require 'uri'
  //     require 'json'

  //     uri = URI.parse('https://feetchair.fish.lgbt/api/flags')
  //     request = Net::HTTP::Get.new(uri)
  //     request['x-client-id'] = '123e4567-e89b-12d3-a456-426614174000'
  //     request['x-client-secret'] = '7afd0a52-e637-465e-91eb-d58875aa6c0a'

  //     req_options = {
  //       use_ssl: uri.scheme == 'https',
  //     }

  //     response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  //       http.request(request)
  //     end

  //     if response.code.to_i == 200
  //       flags = JSON.parse(response.body)
  //       puts "Flags: #{flags}"
  //     else
  //       puts "Failed to get flags."
  //     end
  //   `,
  //   },
  //   {
  //     title: 'Get a single flag',
  //     language: 'ruby',
  //     code: dedent`
  //     require 'net/http'
  //     require 'uri'
  //     require 'json'

  //     uri = URI.parse('https://feetchair.fish.lgbt/api/flags/feature-flag')
  //     request = Net::HTTP::Get.new(uri)
  //     `,
  //   },
  // ],
} as const;

type Tab = keyof typeof tabs;
const tabNames = Object.keys(tabs) as Tab[];

const Loading = () => (
  <div className="flex justify-center items-center h-24">
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.004 8.004 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
);

type CodeBlockProps = {
  code: string;
  language: string;
};

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const [highlighted, setHighlighted] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.removeAttribute('data-highlighted');
    element.innerHTML = code;
    hljs.highlightElement(element);
    setHighlighted(true);

    return () => {
      if (!element) return;
      element.removeAttribute('data-highlighted');
    };
  }, [code]);

  return (
    <pre className="border w-[750px] overflow-x-scroll">
      {!highlighted && <Loading />}
      <code
        ref={ref}
        className={cn(`language-${language} hljs`, {
          hidden: !highlighted,
        })}
      />
    </pre>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<keyof typeof tabs>('curl');

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
        {tabs[activeTab].map(({ title, code, language }, i) => (
          <div key={`${title}-block-${i}`}>
            <h2>{title}</h2>
            <CodeBlock key={`${title}-code-${i}`} code={code} language={language} />
          </div>
        ))}
      </div>
    </main>
  );
}
