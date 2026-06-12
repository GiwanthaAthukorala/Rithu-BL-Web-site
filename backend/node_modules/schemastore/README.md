# schemastore json

offline schemastore.
in vscode, you can config your `.vscode/settings.json`:

```json
"json.schemas": [
	{
		"fileMatch": ["tsconfig*.json"],
		"url": "node_modules/schemastore/json/tsconfig.json"
	}
]
```

or you can run those command in your project:

```shell
schemastore # auto set json.schemas config for you project
schemastore search tsc # find json file in schemastore
schemastore search =tsconfig.json # fileMatchs full equal
schemastore search ~tsconfig.json # fileMatchs startsWith
schemastore search \$tsconfig.json # fileMatchs endsWith
schemastore search tsconfig.json # fileMatchs includes

schemastore add tsconfig package # add search result to your json.schemas
```
