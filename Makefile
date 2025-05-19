IMAGE_NAME = app
CONTAINER_NAME = nextjs-app
PORT = 3000

.PHONY: all
all: build run

.PHONY: build
build:
	@echo "Building Docker image..."
	docker build -t $(IMAGE_NAME) .

.PHONY: run
run:
	@echo "Running Docker container on port $(PORT)..."
	docker run -d --name $(CONTAINER_NAME) -p $(PORT):$(PORT) $(IMAGE_NAME)
	@echo "Application is now running at http://localhost:$(PORT)"

.PHONY: stop
stop:
	@echo "Stopping Docker container..."
	docker stop $(CONTAINER_NAME)

.PHONY: remove
remove: stop
	@echo "Removing Docker container..."
	docker rm $(CONTAINER_NAME)

.PHONY: restart
restart: stop run

.PHONY: clean
clean: remove
	@echo "Removing Docker image..."
	docker rmi $(IMAGE_NAME)

.PHONY: logs
logs:
	docker logs -f $(CONTAINER_NAME)

.PHONY: status
status:
	docker ps -a | grep $(CONTAINER_NAME)

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make build    - Build the Docker image"
	@echo "  make run      - Run the Docker container"
	@echo "  make stop     - Stop the Docker container"
	@echo "  make remove   - Remove the Docker container"
	@echo "  make restart  - Restart the Docker container"
	@echo "  make clean    - Remove container and image"
	@echo "  make logs     - Show container logs"
	@echo "  make status   - Show container status"
	@echo "  make all      - Build and run (default)"
	@echo "  make help     - Show this help message"