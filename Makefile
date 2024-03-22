CURRENT_DIR=$(shell pwd)

APP=$(shell basename ${CURRENT_DIR})

APP_CMD_DIR=${CURRENT_DIR}/cmd

REGISTRY=gitlab.udevs.io:5050
TAG=latest
ENV_TAG=latest
PROJECT_NAME=delever


build:
	CGO_ENABLED=0 GOOS=linux go build -mod=vendor -a -installsuffix cgo -o ${CURRENT_DIR}/bin/${APP} ${APP_CMD_DIR}/main.go

proto-gen:
	./scripts/gen-proto.sh  ${CURRENT_DIR}
	rm -rf vendor/genproto
	sudo rm -rf ${GOROOT}/src/genproto
	sudo cp -R genproto ${GOROOT}/src
	mv genproto vendor

pull-proto-module:
	git submodule update --init --recursive

update-proto-module:
	git submodule update --remote --merge

clear:
	rm -rf ${CURRENT_DIR}/bin/*

network:
	docker network create --driver=bridge ${NETWORK_NAME}

migrate-up:
	docker run --mount type=bind,source="${CURRENT_DIR}/migrations,target=/migrations" --network ${NETWORK_NAME} migrate/migrate \
		-path=/migrations/ -database=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?sslmode=disable up

migrate-down:
	docker run --mount type=bind,source="${CURRENT_DIR}/migrations,target=/migrations" --network ${NETWORK_NAME} migrate/migrate \
		-path=/migrations/ -database=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?sslmode=disable down

mark-as-production-image:
	docker tag ${REGISTRY}/${APP}:${TAG} ${REGISTRY}/${APP}:production
	docker push ${REGISTRY}/${APP}:production

build-image-prod:
	docker build --rm -t ${REGISTRY}/${PROJECT_NAME}/${APP}:${TAG} -f ./Dockerfile-prod .
	docker tag ${REGISTRY}/${PROJECT_NAME}/${APP}:${TAG} ${REGISTRY}/${PROJECT_NAME}/${APP}:${ENV_TAG}

build-image-test:
	docker build --rm -t ${REGISTRY}/${PROJECT_NAME}/${APP}:${TAG} -f ./Dockerfile-test .
	docker tag ${REGISTRY}/${PROJECT_NAME}/${APP}:${TAG} ${REGISTRY}/${PROJECT_NAME}/${APP}:${ENV_TAG}

scan-image:
	trivy image -f json -o image-scan-report.json ${REGISTRY}/${PROJECT_NAME}/${APP}:${TAG}
	trivy image --exit-code 1 --ignore-unfixed --severity HIGH,CRITICAL ${REGISTRY}/${PROJECT_NAME}/${APP}:${TAG}

clear-image:
	docker rmi ${REGISTRY}/${PROJECT_NAME}/${APP}:${TAG}
	docker rmi ${REGISTRY}/${PROJECT_NAME}/${APP}:${ENV_TAG}

push-image:
	docker push ${REGISTRY}/${PROJECT_NAME}/${APP}:${TAG}
	docker push ${REGISTRY}/${PROJECT_NAME}/${APP}:${ENV_TAG}

swag_init:
	swag init -g api/main.go -o api/docs

.PHONY: proto
